import React from 'react';
import { useApp } from '../contexts/AppContext';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowLeft, TrendingUp, Activity, BarChart3 } from 'lucide-react';

interface StatisticsProps {
  onBack: () => void;
}

export const Statistics: React.FC<StatisticsProps> = ({ onBack }) => {
  const { scores, liveData, devices, apps } = useApp();

  // Mock historical data for scores
  const scoreHistory = [
    { name: 'Lun', score: 7.2 },
    { name: 'Mar', score: 7.5 },
    { name: 'Mer', score: 7.1 },
    { name: 'Jeu', score: 7.8 },
    { name: 'Ven', score: 8.2 },
    { name: 'Sam', score: 8.5 },
    { name: 'Dim', score: Number(scores?.t || 8.0) },
  ];

  // Process live data for a heart rate chart
  const hrData = liveData
    .filter(d => d.type === 'heart_rate')
    .slice(0, 20)
    .reverse()
    .map((d, i) => ({ time: i, value: d.value }));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold">Statistiques Réelles</h2>
      </div>

      {/* Life Score Evolution */}
      <section className="p-6 rounded-[2rem] bg-[#1a1a3e] border border-[#7c3aed]/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-[#a0a0cc] uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={14} className="text-[#7c3aed]" /> Évolution Score de Vie
          </h3>
          <span className="text-emerald-400 text-[10px] font-bold">+12% cette semaine</span>
        </div>
        
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={scoreHistory}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6a6a99', fontSize: 10 }} 
                dy={10}
              />
              <YAxis hide domain={[0, 10]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0a1a', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '12px', fontSize: '10px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#7c3aed" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorScore)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Heart Rate Real-time Analysis */}
      {hrData.length > 0 && (
        <section className="p-6 rounded-[2rem] bg-[#1a1a3e] border border-[#7c3aed]/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-[#a0a0cc] uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} className="text-red-400" /> Rythme Cardiaque (Temps Réel)
            </h3>
            <span className="text-white/50 text-[10px] font-mono">LIVE</span>
          </div>

          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hrData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis hide />
                <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a1a', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                  labelStyle={{ display: 'none' }}
                />
                <Line 
                  type="stepAfter" 
                  dataKey="value" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  dot={false}
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-black/20 p-3 rounded-xl border border-white/5">
              <p className="text-[8px] text-[#6a6a99] uppercase mb-1">Moyenne 24h</p>
              <p className="text-lg font-bold">72 <span className="text-[10px] font-normal text-[#6a6a99]">bpm</span></p>
            </div>
            <div className="bg-black/20 p-3 rounded-xl border border-white/5">
              <p className="text-[8px] text-[#6a6a99] uppercase mb-1">Variabilité (VRC)</p>
              <p className="text-lg font-bold">58 <span className="text-[10px] font-normal text-[#6a6a99]">ms</span></p>
            </div>
          </div>
        </section>
      )}

      {/* Data Sources Distribution */}
      <section className="p-6 rounded-[2rem] bg-[#1a1a3e] border border-[#7c3aed]/20">
        <h3 className="text-xs font-bold text-[#a0a0cc] uppercase tracking-widest flex items-center gap-2 mb-6">
          <BarChart3 size={14} className="text-blue-400" /> Fiabilité des Sources
        </h3>
        
        <div className="space-y-4">
          {[
            { name: 'Capteurs Biométriques', value: 95, color: 'bg-emerald-500', connected: devices.some(d => d.connected) },
            { name: 'Open Banking', value: 88, color: 'bg-blue-500', connected: apps.some(a => a.id === 'bank' && a.linked) },
            { name: 'Radar Social', value: 72, color: 'bg-[#7c3aed]', connected: apps.some(a => a.id === 'whatsapp' && a.linked) },
            { name: 'Analyse Sémantique', value: 64, color: 'bg-amber-500', connected: apps.some(a => a.id === 'gmail' && a.linked) }
          ].filter(s => s.connected).map((source, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-white/70">{source.name}</span>
                <span className="font-bold">{source.value}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${source.value}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className={`h-full ${source.color}`}
                />
              </div>
            </div>
          ))}
          {(!devices.some(d => d.connected) && !apps.some(a => a.linked)) && (
            <p className="text-[10px] text-[#6a6a99] text-center py-4 italic">Aucune source de données active.</p>
          )}
        </div>
      </section>
    </div>
  );
};
