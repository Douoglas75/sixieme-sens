import React from 'react';
import { useApp } from '../contexts/AppContext';
import { ScoreData } from '../types';
import { motion } from 'motion/react';
import { HeartPulse, Wallet, Zap, Clock, Check, PiggyBank, ChevronRight } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, scores, alerts, removeAlert, isGenerating, devices, apps, liveData } = useApp();
  const isLive = devices.some(d => d.connected) || apps.some(a => a.linked);

  if (!user || !scores) return null;

  return (
    <div className="space-y-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-1">Bonjour, {user.name} 👋</h1>
          <div className="flex items-center gap-2">
            <p className="text-[#a0a0cc] text-sm">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            {isLive && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
              </div>
            )}
          </div>
        </div>
        {isGenerating && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#7c3aed]/10 rounded-full border border-[#7c3aed]/20">
            <div className="w-3 h-3 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-widest">Analyse IA...</span>
          </div>
        )}
      </div>

      {/* Life Score Card */}
      <div className="relative p-6 rounded-[2rem] bg-gradient-to-br from-[#1a1a3e] to-[#0a0a1a] border border-[#7c3aed]/20 overflow-hidden">
        <div className="absolute top-[-50%] right-[-30%] w-64 h-64 bg-radial-gradient(circle,rgba(124,58,237,.15)_0%,transparent_70%) rounded-full" />
        
        <div className="flex items-center gap-2 text-[10px] font-bold text-[#a0a0cc] tracking-widest uppercase mb-6">
          <span className="text-base">🌡️</span> SCORE DE VIE AUJOURD'HUI
        </div>

        <div className="flex justify-center mb-8">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90">
              <circle cx="72" cy="72" r="64" fill="none" stroke="#1a1a3e" strokeWidth="8" />
              <motion.circle 
                cx="72" cy="72" r="64" fill="none" 
                stroke="url(#scoreGradient)" strokeWidth="8" strokeLinecap="round"
                initial={{ strokeDasharray: 402, strokeDashoffset: 402 }}
                animate={{ strokeDashoffset: 402 - (Number(scores.t) / 10) * 402 }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] bg-clip-text text-transparent leading-none">
                {scores.t}
              </span>
              <span className="text-[10px] text-[#6a6a99] mt-1">/ 10</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'h', icon: '🏥', label: 'Santé', color: 'text-emerald-400' },
            { id: 'f', icon: '💰', label: 'Finance', color: 'text-amber-400' },
            { id: 's', icon: '👥', label: 'Social', color: 'text-blue-400' },
            { id: 'c', icon: '🧠', label: 'Cognitif', color: 'text-purple-400' },
            { id: 'k', icon: '💼', label: 'Carrière', color: 'text-cyan-400' },
            { id: 'a', icon: '📋', label: 'Admin', color: 'text-pink-400' }
          ].map(item => (
            <div key={item.id} className="bg-[#7c3aed]/5 p-3 rounded-xl text-center border border-white/5">
              <div className="text-base mb-1">{item.icon}</div>
              <div className="text-[8px] text-[#6a6a99] uppercase tracking-wider mb-1">{item.label}</div>
              <div className={`text-sm font-bold ${item.color}`}>{scores[item.id as keyof ScoreData]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Health Widget (Only if connected) */}
      {isLive && liveData.some(d => d.type === 'heart_rate') && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <HeartPulse size={20} className="animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] text-[#a0a0cc] uppercase font-bold tracking-widest">Rythme Cardiaque</p>
              <h3 className="text-xl font-black text-white">
                {liveData.find(d => d.type === 'heart_rate')?.value} <span className="text-xs font-normal text-[#6a6a99]">BPM</span>
              </h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-emerald-400 font-bold uppercase mb-1">Stable</p>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <div key={i} className={`w-1 h-3 rounded-full ${i < 4 ? 'bg-red-500' : 'bg-red-500/20'}`} />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Alerts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Zap size={18} className="text-amber-400" /> Alertes Prédictives
          </h2>
          <div className="flex gap-3">
            <span 
              onClick={() => onNavigate('statistics')}
              className="text-xs text-[#06b6d4] font-bold cursor-pointer"
            >
              Stats
            </span>
            <span 
              onClick={() => onNavigate('predictions')}
              className="text-xs text-[#7c3aed] font-bold cursor-pointer"
            >
              Tout voir
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <div 
              key={i} 
              className={`p-4 rounded-2xl bg-[#1a1a3e] border-l-4 flex gap-4 ${
                alert.type === 'red' ? 'border-red-500' : alert.type === 'yellow' ? 'border-amber-500' : 'border-emerald-500'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                alert.type === 'red' ? 'bg-red-500/10 text-red-500' : alert.type === 'yellow' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
              }`}>
                {alert.icon === 'HeartPulse' && <HeartPulse size={20} />}
                {alert.icon === 'Wallet' && <Wallet size={20} />}
                {alert.icon === 'Zap' && <Zap size={20} />}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold mb-1">{alert.title}</h3>
                <p className="text-[11px] text-[#a0a0cc] leading-relaxed mb-2">{alert.desc}</p>
                <div className="flex items-center gap-1 text-[10px] text-[#6a6a99] mb-3">
                  <Clock size={10} /> {alert.time}
                </div>
                <div className="flex gap-2">
                  {alert.actions.map((action, j) => {
                    const isObject = typeof action === 'object';
                    const label = isObject ? action.label : action;
                    const onClick = isObject ? action.onClick : undefined;

                    return (
                      <button 
                        key={j}
                        onClick={() => {
                          if (onClick) onClick();
                          removeAlert(alert.title);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
                          j === 0 ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white' : 'bg-[#0a0a1a] text-[#a0a0cc]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ghost Admin Summary */}
      <div 
        onClick={() => onNavigate('ghost')}
        className="p-4 rounded-2xl bg-gradient-to-br from-[#1a1a3e]/50 to-[#0a0a1a] border border-[#7c3aed]/20 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all"
      >
        <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center text-2xl">🤖</div>
        <div className="flex-1">
          <h3 className="text-sm font-bold">Ghost-Admin</h3>
          <p className="text-[11px] text-[#a0a0cc]">1 tâche ce mois</p>
        </div>
        <div className="px-3 py-1 bg-[#7c3aed] rounded-full text-[10px] font-bold">1/2</div>
      </div>
    </div>
  );
};
