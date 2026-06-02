import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Plus, Crown, PiggyBank, X, Sparkles, ArrowLeft, Navigation, AlertTriangle, RefreshCw } from 'lucide-react';

interface GhostAdminProps {
  onBack?: () => void;
}

export const GhostAdmin: React.FC<GhostAdminProps> = ({ onBack }) => {
  const { ghostTasks, requestGhostTask, addAlert } = useApp();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [gpsActive, setGpsActive] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [motionState, setMotionState] = useState<'stationary' | 'walking'>('stationary');
  const [safetyAlerts, setSafetyAlerts] = useState<any[]>([]);
  const [isScanningSafety, setIsScanningSafety] = useState(false);
  const watchIdRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (gpsActive) {
      const interval = setInterval(() => {
        setMotionState(prev => prev === 'stationary' ? 'walking' : 'stationary');
      }, 12000);
      return () => clearInterval(interval);
    }
  }, [gpsActive]);

  const toggleGpsSentinel = () => {
    if (gpsActive) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setGpsActive(false);
      setLocation(null);
      setSafetyAlerts([]);
    } else {
      if (!navigator.geolocation) {
        addAlert({
          title: 'GPS Non Supporté',
          desc: 'La géolocalisation n\'est pas supportée par votre appareil.',
          type: 'red',
          icon: '📍',
          time: 'À l\'instant',
          actions: []
        });
        return;
      }

      setIsScanningSafety(true);
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocation({ lat, lon });
          
          try {
            const res = await fetch(`/api/data/location/safety-alerts?lat=${lat}&lon=${lon}`);
            if (res.ok) {
              const data = await res.json();
              setSafetyAlerts(data.alerts || []);
              
              // Map safety alerts to App Alerts
              data.alerts.forEach((alert: any) => {
                addAlert({
                  title: `[🔑 Sentinelle GPS] ${alert.title}`,
                  desc: alert.desc,
                  type: alert.type,
                  icon: alert.icon || '🚨',
                  time: 'À l\'instant',
                  actions: alert.actions || []
                });
              });
            }
          } catch (e) {
            console.error("Failed to fetch location safety alerts", e);
          } finally {
            setIsScanningSafety(false);
          }
        },
        (error) => {
          console.error("GPS Watch error", error);
          setIsScanningSafety(false);
          addAlert({
            title: 'Erreur Géolocalisation',
            desc: 'Abonnement GPS échoué. Vérifiez vos autorisations de localisation.',
            type: 'red',
            icon: '⚠️',
            time: 'À l\'instant',
            actions: []
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      watchIdRef.current = id;
      setGpsActive(true);
    }
  };

  React.useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

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

      {/* Sentinelle Urbaine GPS Module */}
      <div className="p-5 rounded-[2rem] bg-gradient-to-br from-[#111827] to-[#1f2937] border border-red-500/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center text-red-400">
              <Navigation className={`w-4 h-4 ${gpsActive ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white">🛰️ Sentinelle Urbaine (GPS)</h3>
              <p className="text-[9px] text-[#a0a0cc]">Surveillance locale active 24/7</p>
            </div>
          </div>
          <button 
            onClick={toggleGpsSentinel}
            className={`px-3 py-1.5 rounded-xl text-[10px] uppercase font-bold transition-all ${
              gpsActive 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {gpsActive ? 'Désactiver' : 'Activer Ghost-Guard'}
          </button>
        </div>

        {gpsActive ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono bg-[#0a0a1a]/55 p-3 rounded-xl border border-white/5">
              <div className="space-y-1">
                <span className="text-[#6a6a99] block uppercase text-[8px]">LOCALISATION :</span>
                {location ? (
                  <span className="text-white font-bold">{location.lat.toFixed(5)}, {location.lon.toFixed(5)}</span>
                ) : (
                  <span className="text-amber-400 font-bold animate-pulse">RECHERCHE GPS...</span>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[#6a6a99] block uppercase text-[8px]">ÉTAT DU SUJET :</span>
                <span className={`font-bold flex items-center gap-1 ${motionState === 'walking' ? 'text-blue-400' : 'text-emerald-400'}`}>
                  {motionState === 'walking' ? '🚶 En déplacement' : '🛑 Stationnaire'}
                </span>
              </div>
            </div>

            {isScanningSafety && (
              <div className="flex items-center gap-2 text-[9px] text-[#a0a0cc] p-2 bg-white/5 rounded-xl">
                <RefreshCw size={10} className="animate-spin text-blue-400" />
                <span>Analyse IA des alertes de rue par rapport aux coordonnées...</span>
              </div>
            )}

            {safetyAlerts.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-[9px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                  <AlertTriangle size={10} /> ALERTES GÉOLOCALISÉES PROCHES :
                </h4>
                {safetyAlerts.map((alert, i) => (
                  <div key={i} className={`p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{alert.icon || '🚨'}</span>
                        <span className="text-[11px] font-bold text-white">{alert.title}</span>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                        alert.type === 'red' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>{alert.type}</span>
                    </div>
                    <p className="text-[10px] text-[#a0a0cc] leading-relaxed">{alert.desc}</p>
                    <div className="flex items-center justify-between text-[8px] text-[#6a6a99]">
                      <span>{alert.time}</span>
                      {alert.actions && alert.actions.length > 0 && (
                        <div className="flex gap-1.5">
                          {alert.actions.map((act: string, idx: number) => (
                            <span key={idx} className="bg-white/10 px-1.5 py-0.5 rounded text-white">{act}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !isScanningSafety && (
                <div className="p-3 text-center text-[10px] text-emerald-400 bg-emerald-500/10 rounded-xl font-bold">
                  🟢 Aucun danger immédiat sur votre itinéraire actuel.
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-[10px] text-[#a0a0cc] leading-relaxed">
            La Sentinelle GPS interroge en temps réel notre IA de sécurité pour détecter les incendies, ralentissements métro/RER, agressions de rue ou fermetures d'avenues à proximité directe de votre itinéraire de marche.
          </p>
        )}
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
