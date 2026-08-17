import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useWebSocket } from './hooks/useWebSocket';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Backend base URL (use Vite env var when available, fallback to provided Cloudflare URL)
const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'https://aluminum-horses-element-keith.trycloudflare.com';
// WebSocket base: allow explicit VITE_BACKEND_WS or derive from BACKEND_BASE
const WS_BASE = import.meta.env.VITE_BACKEND_WS || BACKEND_BASE.replace(/^http/, 'ws');

export default function App() {
  const [signal, setSignal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { lastMessage } = useWebSocket(`${WS_BASE}/ws`);

  useEffect(() => {
    const fetchSignal = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_BASE}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rsi: 65, atr: 25 })
        });
        
        if (!response.ok) throw new Error('Gagal mengambil sinyal');
        
        const data = await response.json();
        setSignal({
          action: data.action,
          probability: data.probability,
          confidence: data.confidence,
          pattern: data.pattern,
          sentiment: data.sentiment,
          sentiment_score: data.sentiment_score,
          entry: 2050,
          sl: 2040,
          tp: 2080,
          lot: 0.01
        });
        setError(null);
      } catch (err) {
        setError(err.message);
        // Gunakan data mock jika gagal
        setSignal({
          action: 'WAIT',
          probability: 0.78,
          confidence: 'HIGH',
          pattern: 'Bullish FVG',
          sentiment: 'Bullish',
          sentiment_score: 72,
          entry: 2050,
          sl: 2040,
          tp: 2080,
          lot: 0.01
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSignal();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161a1e] text-white flex items-center justify-center">
        <div className="text-xl">Memuat...</div>
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="min-h-screen bg-[#161a1e] text-white flex items-center justify-center">
        <div className="text-xl text-red-400">Gagal memuat sinyal</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161a1e] text-white font-sans">
      <nav className="bg-[#1e2329] border-b border-[#2b3139] px-6 py-3 flex justify-between items-center">
        <span className="text-xl font-bold text-[#f0b90b]">Xhubxhack AI</span>
        <div className="text-sm">
          <span>Saldo: $12,450</span>
          {error && <span className="ml-4 text-red-400 text-xs">{error}</span>}
        </div>
      </nav>
      <div className="flex p-4 gap-4 h-[calc(100vh-60px)]">
        <div className="w-[70%] bg-[#1e2329] rounded-lg p-2">
          <Line 
            data={{
              labels: Array(50).fill(''),
              datasets: [{
                data: Array(50).fill(0).map(() => 2000 + Math.random() * 100),
                borderColor: '#f0b90b',
                borderWidth: 2
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } }
            }}
          />
        </div>
        <div className="w-[30%] flex flex-col gap-2">
          <div className="bg-[#1e2329] rounded-lg p-4 flex-1">
            <div className="text-sm text-gray-400 mb-2">🧠 PROFESOR AI</div>
            <div className={`text-4xl font-bold ${signal.action === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
              {signal.action}
            </div>
            <div className="grid grid-cols-2 mt-4 gap-2 text-xs">
              <div>
                <div className="text-gray-500">Probabilitas</div>
                <div className="text-blue-400">{(signal.probability * 100).toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-gray-500">Pola</div>
                <div className="text-white">{signal.pattern}</div>
              </div>
              <div>
                <div className="text-gray-500">Sentimen</div>
                <div className="text-green-400">{signal.sentiment}</div>
              </div>
              <div>
                <div className="text-gray-500">Lot</div>
                <div className="text-white">{signal.lot}</div>
              </div>
            </div>
            <div className="mt-3 bg-[#161a1e] p-2 rounded text-yellow-300 text-[11px]">
              💡 SMC FVG terdeteksi + Probabilitas ML > 75%
            </div>
          </div>
          <div className="bg-[#1e2329] rounded-lg p-4 h-40">
            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-green-500 hover:bg-green-400 py-2 rounded text-sm font-bold">✅ Setuju</button>
              <button className="flex-1 bg-[#2b3139] hover:bg-[#3b4149] py-2 rounded text-sm font-bold text-red-400">❌ Tolak</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
