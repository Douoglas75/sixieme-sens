import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { motion } from 'motion/react';
import { Calendar, Info, TrendingUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

export const Predictions: React.FC = () => {
  const { predictions, dismissPrediction } = useApp();
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
          <motion.div 
            key={p.id} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-[#1a1a3e] border border-[#7c3aed]/20"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                p.type === 'health' ? 'bg-emerald-500/10 text-emerald-500' : 
                p.type === 'finance' ? 'bg-amber-500/10 text-amber-500' : 
                p.type === 'social' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
              }`}>
                {p.cat}
              </span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#06b6d4]">
                <TrendingUp size={12} /> {p.conf}% confiance
              </div>
            </div>
            
            <h3 className="text-sm font-bold mb-1.5">{p.title}</h3>
            <p className="text-[11px] text-[#a0a0cc] leading-relaxed mb-3">{p.desc}</p>
            
            <div className="flex items-center gap-1.5 text-[10px] text-[#6a6a99] mb-4">
              <Calendar size={12} className="text-[#06b6d4]" /> {p.tl}
            </div>

            {/* Chart Area */}
            <div className="h-24 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={p.cd.map((v, i) => ({ name: i, value: v }))}>
                  <defs>
                    <linearGradient id={`grad-${p.id}`} x1="0" y1="0" x2="0" y2="100%">
                      <stop offset="5%" stopColor={clr[p.type]} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={clr[p.type]} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={clr[p.type]} 
                    fillOpacity={1} 
                    fill={`url(#grad-${p.id})`} 
                    strokeWidth={2}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a1a', border: '1px solid rgba(124,58,237,.2)', borderRadius: '8px', fontSize: '10px' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ display: 'none' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-[#06b6d4]/10 rounded-xl flex flex-col gap-3">
              <div className="flex gap-2">
                <Info size={14} className="text-[#06b6d4] shrink-0 mt-0.5" />
                <p className="text-[10px] text-[#a0a0cc] italic">{p.rec}</p>
              </div>
              <button 
                onClick={() => {
                  alert(`Recommandation appliquée : ${p.rec}`);
                  dismissPrediction(p.id);
                }}
                className="w-full py-2 bg-[#06b6d4]/20 text-[#06b6d4] rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#06b6d4]/30 transition-all active:scale-95"
              >
                Appliquer la recommandation
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
