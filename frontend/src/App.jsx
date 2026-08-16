import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';

export default function App() {
  const [signal, setSignal] = useState({ action: 'WAIT', probability: 0.78, confidence: 'HIGH', pattern: 'Bullish FVG', sentiment: 'Bullish', entry: 2050, sl: 2040, tp: 2080, lot: 0.01 });
  return (
    <div className="min-h-screen bg-[#161a1e] text-white font-sans">
      <nav className="bg-[#1e2329] border-b border-[#2b3139] px-6 py-3 flex justify-between items-center">
        <span className="text-xl font-bold text-[#f0b90b]">Xhubxhack AI</span>
        <div className="text-sm"><span>Balance: $12,450</span></div>
      </nav>
      <div className="flex p-4 gap-4 h-[calc(100vh-60px)]">
        <div className="w-[70%] bg-[#1e2329] rounded-lg p-2">
          <Line data={{ labels: Array(50).fill(''), datasets: [{ data: Array(50).fill(0).map(()=>2000+Math.random()*100), borderColor:'#f0b90b', borderWidth:2 }] }} options={{ responsive: true, maintainAspectRatio:false }} />
        </div>
        <div className="w-[30%] flex flex-col gap-2">
          <div className="bg-[#1e2329] rounded-lg p-4 flex-1">
            <div className="text-sm text-gray-400 mb-2">🧠 AI PROFESSOR</div>
            <div className={`text-4xl font-bold ${signal.action==='BUY'?'text-green-400':'text-red-400'}`}>{signal.action}</div>
            <div className="grid grid-cols-2 mt-4 gap-2 text-xs">
              <div><div className="text-gray-500">Probability</div><div className="text-blue-400">{(signal.probability*100).toFixed(0)}%</div></div>
              <div><div className="text-gray-500">Pattern</div><div className="text-white">{signal.pattern}</div></div>
              <div><div className="text-gray-500">Sentimen</div><div className="text-green-400">{signal.sentiment}</div></div>
              <div><div className="text-gray-500">Lot</div><div className="text-white">{signal.lot}</div></div>
            </div>
            <div className="mt-3 bg-[#161a1e] p-2 rounded text-yellow-300 text-[11px]">💡 SMC FVG detected + ML Probability > 75%</div>
          </div>
          <div className="bg-[#1e2329] rounded-lg p-4 h-40">
            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-green-500 hover:bg-green-400 py-2 rounded text-sm font-bold">✅ Approve</button>
              <button className="flex-1 bg-[#2b3139] hover:bg-[#3b4149] py-2 rounded text-sm font-bold text-red-400">❌ Reject</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
