import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Plus, Crown, PiggyBank, X, Sparkles, ArrowLeft } from 'lucide-react';

interface GhostAdminProps {
  onBack?: () => void;
}

export const GhostAdmin: React.FC<GhostAdminProps> = ({ onBack }) => {
  const { ghostTasks, requestGhostTask } = useApp();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [taskName, setTaskName] = useState('');

  const handleRequest = async () => {
    if (taskName) {
      await requestGhostTask(taskName);
      setShowRequestModal(false);
      setTaskName('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 bg-white/5 rounded-xl">
              <ArrowLeft size={16} />
            </button>
          )}
          <h2 className="text-lg font-bold">🤖 Ghost-Admin</h2>
        </div>
        <button 
          onClick={() => setShowRequestModal(true)}
          className="w-10 h-10 rounded-full bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed]"
        >
          <Plus size={20} />
        </button>
      </div>

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
        <h2 className="text-base font-bold">📋 Tâches actives</h2>
        
        {ghostTasks.map(task => (
          <motion.div 
            key={task.id} 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-[#1a1a3e] border border-[#7c3aed]/20"
          >
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

            {task.st === 'progress' && task.progress !== undefined && (
              <div className="mb-3">
                <div className="flex justify-between text-[8px] text-[#6a6a99] uppercase mb-1">
                  <span>Progression</span>
                  <span>{Math.round(task.progress)}%</span>
                </div>
                <div className="h-1.5 bg-[#0a0a1a] rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#7c3aed]"
                    initial={{ width: 0 }}
                    animate={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            )}

            {task.sav && (
              <div className="p-2.5 bg-emerald-500/10 rounded-xl flex items-center gap-2 text-[10px] text-emerald-400 font-medium">
                <PiggyBank size={14} />
                <span>{task.sav}</span>
              </div>
            )}

            {task.st === 'available' && (
              <button 
                onClick={() => setShowRequestModal(true)}
                className="w-full mt-2 py-2.5 bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] rounded-xl text-[10px] font-bold flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Choisir une tâche
              </button>
            )}
          </motion.div>
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

      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRequestModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#1a1a3e] border border-[#7c3aed]/30 rounded-[2rem] p-8 shadow-2xl"
            >
              <button 
                onClick={() => setShowRequestModal(false)}
                className="absolute top-6 right-6 text-[#a0a0cc]"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-xl font-bold mb-2">Nouvelle tâche</h3>
              <p className="text-xs text-[#a0a0cc] mb-6">Que doit faire Ghost-Admin pour vous ?</p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-[10px] text-[#6a6a99] uppercase font-bold mb-1.5 block">Description de la tâche</label>
                  <textarea 
                    value={taskName}
                    onChange={e => setTaskName(e.target.value)}
                    className="w-full bg-[#0a0a1a] border border-[#7c3aed]/20 rounded-xl p-3 text-sm outline-none focus:border-[#7c3aed] h-24 resize-none"
                    placeholder="Ex: Trouver un meilleur contrat d'énergie..."
                  />
                </div>
              </div>

              <button 
                onClick={handleRequest}
                className="w-full py-4 bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <Sparkles size={18} /> Lancer l'IA
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
