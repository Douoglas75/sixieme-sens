import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield as ShieldIcon, Target, Smartphone, Moon, Search, ShieldCheck } from 'lucide-react';

export const Shield: React.FC = () => {
  const [focusMode, setFocusMode] = useState(true);
  const [antiScroll, setAntiScroll] = useState(false);
  const [nightMode, setNightMode] = useState(false);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-[2rem] bg-gradient-to-br from-[#1a1a3e] to-[#0a0a1a] border border-[#7c3aed]/20 text-center">
        <div className="text-5xl mb-4">🛡️</div>
        <h2 className="text-lg font-bold mb-1">Bouclier Cognitif</h2>
        <p className="text-[#a0a0cc] text-xs mb-6">Protection attention & anti-désinformation</p>
        
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-[10px] font-bold text-[#a0a0cc] uppercase tracking-wider">
            <span>Capital Attentionnel</span>
            <span className="text-[#06b6d4]">78%</span>
          </div>
          <div className="h-2.5 bg-[#1a1a3e] rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "78%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#10b981] to-[#06b6d4] rounded-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { val: '23', label: 'Distractions bloquées' },
            { val: '2h14', label: 'Temps profond' },
            { val: '+34%', label: 'Productivité' }
          ].map((stat, i) => (
            <div key={i} className="p-3 bg-[#7c3aed]/5 rounded-xl border border-white/5">
              <div className="text-lg font-bold text-[#06b6d4]">{stat.val}</div>
              <div className="text-[8px] text-[#6a6a99] uppercase leading-tight mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold flex items-center gap-2">🎛️ Modes</h2>
        
        <div className={`p-4 rounded-2xl bg-[#1a1a3e] border border-[#7c3aed]/20 flex items-center gap-4 transition-all ${focusMode ? 'shadow-lg shadow-[#7c3aed]/10 border-[#7c3aed]/50' : ''}`}>
          <div className="w-11 h-11 rounded-xl bg-[#7c3aed]/15 flex items-center justify-center text-xl">🎯</div>
          <div className="flex-1">
            <h3 className="text-sm font-bold">Deep Focus</h3>
            <p className="text-[10px] text-[#a0a0cc]">Bloque notifications sauf urgences</p>
          </div>
          <button 
            onClick={() => setFocusMode(!focusMode)}
            className={`w-11 h-6 rounded-full relative transition-colors ${focusMode ? 'bg-[#7c3aed]' : 'bg-[#111128]'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${focusMode ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>

        <div className={`p-4 rounded-2xl bg-[#1a1a3e] border border-[#7c3aed]/20 flex items-center gap-4 transition-all ${antiScroll ? 'shadow-lg shadow-[#7c3aed]/10 border-[#7c3aed]/50' : ''}`}>
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center text-xl">📱</div>
          <div className="flex-1">
            <h3 className="text-sm font-bold">Anti-Scroll</h3>
            <p className="text-[10px] text-[#a0a0cc]">Alerte après 10 min de scroll</p>
          </div>
          <button 
            onClick={() => setAntiScroll(!antiScroll)}
            className={`w-11 h-6 rounded-full relative transition-colors ${antiScroll ? 'bg-[#7c3aed]' : 'bg-[#111128]'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${antiScroll ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>

        <div className={`p-4 rounded-2xl bg-[#1a1a3e] border border-[#7c3aed]/20 flex items-center gap-4 transition-all ${nightMode ? 'shadow-lg shadow-[#7c3aed]/10 border-[#7c3aed]/50' : ''}`}>
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center text-xl">🌙</div>
          <div className="flex-1">
            <h3 className="text-sm font-bold">Mode Nuit</h3>
            <p className="text-[10px] text-[#a0a0cc]">Réduit stimulation avant coucher</p>
          </div>
          <button 
            onClick={() => setNightMode(!nightMode)}
            className={`w-11 h-6 rounded-full relative transition-colors ${nightMode ? 'bg-[#7c3aed]' : 'bg-[#111128]'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${nightMode ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#1a1a3e] border border-dashed border-[#7c3aed]/30 text-center">
        <Search size={36} className="mx-auto text-[#7c3aed] mb-3" />
        <h3 className="text-sm font-bold mb-1">Analyseur Fiabilité</h3>
        <p className="text-[11px] text-[#a0a0cc] mb-4">Collez un lien ou texte pour détecter les biais et deepfakes</p>
        <input 
          className="w-full p-3 bg-[#111128] border border-[#7c3aed]/20 rounded-xl text-xs outline-none mb-3" 
          placeholder="Collez un lien ou du texte..." 
        />
        <button className="w-full py-3 bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] rounded-xl text-xs font-bold flex items-center justify-center gap-2">
          <ShieldCheck size={14} /> Analyser
        </button>
      </div>
    </div>
  );
};
