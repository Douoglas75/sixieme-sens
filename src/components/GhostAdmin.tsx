import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Check, Plus, Crown, PiggyBank } from 'lucide-react';

export const GhostAdmin: React.FC = () => {
  const { ghostTasks } = useApp();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">🤖 Ghost-Admin</h2>

      <div className="p-6 rounded-[2rem] bg-gradient-to-br from-[#1a1a3e] to-[#0a0a1a] border border-[#7c3aed]/20 text-center">
        <h3 className="text-sm font-bold mb-1.5">Quota mensuel</h3>
        <p className="text-[11px] text-[#a0a0cc] mb-6">INTUITION — 2 tâches / mois</p>
        
        <div className="flex justify-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#7c3aed]/20 border-2 border-[#7c3aed] flex items-center justify-center text-xl">
            <Check className="text-[#7c3aed]" />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 border-dashed flex items-center justify-center text-xl">
            <Plus className="text-emerald-500" />
          </div>
        </div>
        
        <p className="text-[11px] text-[#6a6a99]">1 utilisée · 1 restante</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-bold">📋 Tâches</h2>
        
        {ghostTasks.map(task => (
          <div key={task.id} className="p-4 rounded-2xl bg-[#1a1a3e] border border-[#7c3aed]/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: task.bg }}>
                {task.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold">{task.title}</h4>
                <p className="text-[10px] text-[#a0a0cc]">{task.desc}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                task.st === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                task.st === 'progress' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
              }`}>
                {task.stl}
              </span>
            </div>

            {task.sav && (
              <div className="p-2.5 bg-emerald-500/10 rounded-xl flex items-center gap-2 text-[10px] text-emerald-400 font-medium">
                <PiggyBank size={14} />
                <span>{task.sav}</span>
              </div>
            )}

            {task.st === 'available' && (
              <button className="w-full mt-2 py-2.5 bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] rounded-xl text-[10px] font-bold flex items-center justify-center gap-2">
                <Plus size={14} /> Choisir une tâche
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] text-center shadow-lg shadow-[#7c3aed]/20">
        <Crown size={32} className="mx-auto text-white mb-2" />
        <h3 className="text-base font-bold mb-1">💎 CLAIRVOYANCE</h3>
        <p className="text-[11px] opacity-90 mb-4">20 tâches/mois + négociateur auto + plus</p>
        <button className="px-8 py-2.5 bg-white text-[#7c3aed] rounded-xl text-xs font-bold">
          9,99€ / mois
        </button>
      </div>
    </div>
  );
};
