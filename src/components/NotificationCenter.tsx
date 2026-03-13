import React from 'react';
import { useApp } from '../contexts/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, HeartPulse, Wallet, Zap, Clock, Check } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { alerts, removeAlert } = useApp();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-[#0a0a1a] border-l border-[#7c3aed]/20 z-[101] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-[#7c3aed]/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed]">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Centre de Notifications</h2>
                  <p className="text-[10px] text-[#6a6a99] uppercase tracking-widest font-black">Intelligence Active</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {alerts.length > 0 && (
                  <button 
                    onClick={() => alerts.forEach(a => removeAlert(a.title))}
                    className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-wider hover:text-[#9d66ff] transition-colors"
                  >
                    Tout effacer
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={20} className="text-[#a0a0cc]" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {alerts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-[#1a1a3e] flex items-center justify-center mb-4">
                    <Check size={32} className="text-[#6a6a99]" />
                  </div>
                  <h3 className="text-sm font-bold mb-1">Tout est sous contrôle</h3>
                  <p className="text-xs text-[#6a6a99]">Aucune alerte prédictive pour le moment.</p>
                </div>
              ) : (
                alerts.map((alert, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
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
                      {typeof alert.icon === 'string' && alert.icon.length > 2 && !['HeartPulse', 'Wallet', 'Zap'].includes(alert.icon) && <span>{alert.icon}</span>}
                      {typeof alert.icon === 'string' && alert.icon.length <= 2 && <span>{alert.icon}</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-sm font-bold">{alert.title}</h3>
                        <button onClick={() => removeAlert(alert.title)} className="text-[#6a6a99] hover:text-white">
                          <X size={14} />
                        </button>
                      </div>
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
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-[#7c3aed]/10">
              <button 
                onClick={onClose}
                className="w-full py-3 bg-[#1a1a3e] rounded-xl text-xs font-bold text-[#a0a0cc] hover:text-white transition-colors"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
