import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { motion } from 'motion/react';
import { Calendar, Info } from 'lucide-react';

export const Predictions: React.FC = () => {
  const { predictions } = useApp();
  const [filter, setFilter] = useState('all');

  const filteredPredictions = filter === 'all' 
    ? predictions 
    : predictions.filter(p => p.type === filter);

  const tabs = [
    { id: 'all', label: 'Toutes' },
    { id: 'health', label: '🏥 Santé' },
    { id: 'finance', label: '💰 Finance' },
    { id: 'social', label: '👥 Social' },
    { id: 'cognitive', label: '🧠 Cognitif' }
  ];

  const clr: any = {
    health: '#10b981',
    finance: '#f59e0b',
    social: '#3b82f6',
    cognitive: '#7c3aed'
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">📊 Prédictions</h2>
      
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              filter === tab.id ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] border-transparent' : 'bg-[#1a1a3e] border-[#7c3aed]/20 text-[#a0a0cc]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredPredictions.map(p => (
          <div key={p.id} className="p-4 rounded-2xl bg-[#1a1a3e] border border-[#7c3aed]/20">
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                p.type === 'health' ? 'bg-emerald-500/10 text-emerald-500' : 
                p.type === 'finance' ? 'bg-amber-500/10 text-amber-500' : 
                p.type === 'social' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
              }`}>
                {p.cat}
              </span>
              <span className="text-[10px] text-[#6a6a99]">
                Confiance : <strong className="text-[#06b6d4]">{p.conf}%</strong>
              </span>
            </div>
            
            <h3 className="text-sm font-bold mb-1.5">{p.title}</h3>
            <p className="text-[11px] text-[#a0a0cc] leading-relaxed mb-3">{p.desc}</p>
            
            <div className="flex items-center gap-1.5 text-[10px] text-[#6a6a99] mb-4">
              <Calendar size={12} className="text-[#06b6d4]" /> {p.tl}
            </div>

            <div className="h-16 bg-[#7c3aed]/5 rounded-lg mb-4 flex items-end p-2 gap-1">
              {p.cd.map((v, i) => (
                <div 
                  key={i} 
                  className="flex-1 rounded-t-sm" 
                  style={{ 
                    height: `${v * 0.6}px`, 
                    backgroundColor: clr[p.type],
                    opacity: 0.4 + (v / 200)
                  }} 
                />
              ))}
            </div>

            <div className="p-3 bg-[#06b6d4]/10 rounded-xl flex gap-2">
              <Info size={14} className="text-[#06b6d4] shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#a0a0cc] italic">{p.rec}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
