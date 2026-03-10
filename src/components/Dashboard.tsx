import React from 'react';
import { useApp } from '../contexts/AppContext';
import { ScoreData } from '../types';
import { motion } from 'motion/react';
import { HeartPulse, Wallet, Zap, Clock, Check, PiggyBank, ChevronRight } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, scores, alerts } = useApp();

  if (!user || !scores) return null;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Bonjour, {user.name} 👋</h1>
        <p className="text-[#a0a0cc] text-sm">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
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

      {/* Alerts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Zap size={18} className="text-amber-400" /> Alertes Prédictives
          </h2>
          <span 
            onClick={() => onNavigate('predictions')}
            className="text-xs text-[#7c3aed] font-bold cursor-pointer"
          >
            Tout voir
          </span>
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
                  {alert.actions.map((action, j) => (
                    <button 
                      key={j}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        j === 0 ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white' : 'bg-[#0a0a1a] text-[#a0a0cc]'
                      }`}
                    >
                      {action}
                    </button>
                  ))}
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
