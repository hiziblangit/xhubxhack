import { useEffect, useState } from 'react';
export function useWebSocket(url) {
  const [lastMessage, setLastMessage] = useState(null);
  useEffect(() => { const ws = new WebSocket(url); ws.onmessage = (e) => setLastMessage(JSON.parse(e.data)); return () => ws.close(); }, [url]);
  return { lastMessage };
}
