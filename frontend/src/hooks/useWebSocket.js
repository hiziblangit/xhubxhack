import { useEffect, useState } from 'react';

export function useWebSocket(url) {
  const [lastMessage, setLastMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let ws;
    let reconnectTimeout;

    const connect = () => {
      try {
        ws = new WebSocket(url);

        ws.onopen = () => {
          setIsConnected(true);
          console.log('WebSocket terhubung');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastMessage(data);
          } catch (error) {
            console.error('Gagal parse pesan WebSocket:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('Error WebSocket:', error);
          setIsConnected(false);
        };

        ws.onclose = () => {
          setIsConnected(false);
          console.log('WebSocket terputus');
          // Reconnect setelah 3 detik
          reconnectTimeout = setTimeout(connect, 3000);
        };
      } catch (error) {
        console.error('Gagal buat WebSocket:', error);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) {
        ws.close();
      }
    };
  }, [url]);

  return { lastMessage, isConnected };
}
