import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useSecurity } from '../contexts/SecurityContext';
import { User as UserIcon, Watch, Bell, Clock, Brain, Lock, ShieldCheck, Download, Trash2, Crown, ChevronRight, Cloud, X, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { hapticFeedback } from '../utils/haptics';

interface SettingsProps {
  onNavigate: (page: any) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const { lock, hasPin, setupPin } = useSecurity();
  const { user, setUser, scores, addAlert } = useApp();
  const [cloudSync, setCloudSync] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPinSetupModal, setShowPinSetupModal] = useState(false);
  const [newPinCode, setNewPinCode] = useState('');
  const [confirmPinCode, setConfirmPinCode] = useState('');
  const [pinStep, setPinStep] = useState<'pin' | 'confirm'>('pin');
  const [lockOnStart, setLockOnStart] = useState(() => localStorage.getItem('6s_lock_on_start') === 'true');
  const [editUser, setEditUser] = useState(user || { name: '', sleep: 7, activity: 'medium', finance: 'ok', contacts: [] });

  const handleCreatePin = async () => {
    if (newPinCode.length !== 4) return;
    if (pinStep === 'pin') {
      setConfirmPinCode(newPinCode);
      setNewPinCode('');
      setPinStep('confirm');
    } else {
      if (newPinCode === confirmPinCode) {
        await setupPin(newPinCode);
        localStorage.setItem('6s_lock_on_start', 'true');
        setLockOnStart(true);
        setShowPinSetupModal(false);
        setNewPinCode('');
        setConfirmPinCode('');
        setPinStep('pin');
        addAlert({
          title: 'Code PIN Activé',
          desc: 'Votre code PIN a été configuré avec succès et le verrouillage au démarrage est activé.',
          type: 'green',
          icon: '🔐',
          time: 'À l\'instant',
          actions: []
        });
      } else {
        alert('Les codes PIN ne correspondent pas.');
        setNewPinCode('');
        setPinStep('pin');
      }
    }
  };

  const handleDeletePin = () => {
    hapticFeedback('heavy');
    localStorage.removeItem('6s_auth_ok');
    localStorage.removeItem('6s_auth_salt');
    localStorage.removeItem('6s_auth_vf');
    localStorage.removeItem('6s_lock_on_start');
    setLockOnStart(false);
    // reload to reset context
    window.location.reload();
  };

  const handleSaveProfile = () => {
    hapticFeedback('medium');
    setUser(editUser as any);
    setShowProfileModal(false);
  };

  const handleReset = () => {
    hapticFeedback('heavy');
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">⚙️ Paramètres</h2>
      
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a3e] border border-[#7c3aed]/20 rounded-xl text-xs">
        <span className="text-base">👁️</span>
        <span>Plan <strong>INTUITION</strong> (Gratuit)</span>
      </div>

      <div className="space-y-4">
        <section className="space-y-2">
          <h3 className="text-[10px] font-bold text-[#6a6a99] uppercase tracking-widest px-1">Profil</h3>
          <div className="space-y-1.5">
            <div 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 p-4 bg-[#1a1a3e] rounded-xl cursor-pointer active:scale-[0.98] transition-all"
            >
              <UserIcon size={18} className="text-[#7c3aed]" />
              <span className="flex-1 text-sm">Mon profil</span>
              <ChevronRight size={16} className="text-[#6a6a99]" />
            </div>
            <div 
              onClick={() => onNavigate('connections')}
              className="flex items-center gap-3 p-4 bg-[#1a1a3e] rounded-xl cursor-pointer active:scale-[0.98] transition-all"
            >
              <Watch size={18} className="text-[#7c3aed]" />
              <span className="flex-1 text-sm">Appareils & Apps</span>
              <ChevronRight size={16} className="text-[#6a6a99]" />
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-[10px] font-bold text-[#6a6a99] uppercase tracking-widest px-1">Sécurité & Cloud</h3>
          <div className="space-y-1.5">
            {hasPin ? (
              <>
                <div 
                  onClick={lock}
                  className="flex items-center gap-3 p-4 bg-[#1a1a3e] rounded-xl cursor-pointer active:scale-[0.98] transition-all"
                >
                  <Lock size={18} className="text-amber-500" />
                  <span className="flex-1 text-sm">Verrouiller la session</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#1a1a3e] rounded-xl">
                  <div className="flex items-center gap-3">
                    <Lock size={18} className="text-purple-500" />
                    <div>
                      <span className="block text-sm">Verrouiller au démarrage</span>
                      <span className="block text-[9px] text-[#6a6a99]">Demander le PIN au lancement de l'app</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const nextVal = !lockOnStart;
                      localStorage.setItem('6s_lock_on_start', nextVal ? 'true' : 'false');
                      setLockOnStart(nextVal);
                    }}
                    className={`w-11 h-6 rounded-full relative transition-colors ${lockOnStart ? 'bg-[#7c3aed]' : 'bg-[#111128] border border-white/10'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${lockOnStart ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </div>
                <div 
                  onClick={handleDeletePin}
                  className="flex items-center gap-3 p-4 bg-[#1a1a3e] rounded-xl cursor-pointer active:scale-[0.98] transition-all text-red-400"
                >
                  <Trash2 size={18} className="text-red-400" />
                  <span className="flex-1 text-sm">Supprimer le code PIN</span>
                </div>
              </>
            ) : (
              <div 
                onClick={() => {
                  setNewPinCode('');
                  setConfirmPinCode('');
                  setPinStep('pin');
                  setShowPinSetupModal(true);
                }}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 to-[#7c3aed]/10 border border-[#7c3aed]/20 rounded-xl cursor-pointer active:scale-[0.98] transition-all hover:bg-[#7c3aed]/10"
              >
                <Lock size={18} className="text-[#a855f7]" />
                <div className="flex-1">
                  <span className="block text-sm font-bold text-purple-300">🛡️ Protéger par code PIN Optionnel</span>
                  <span className="block text-[9px] text-[#a0a0cc]">Ajoutez une couche de sécurité si vous le souhaitez</span>
                </div>
                <ChevronRight size={16} className="text-[#7c3aed]" />
              </div>
            )}
            <div className="flex items-center gap-3 p-4 bg-[#1a1a3e] rounded-xl">
              <Cloud size={18} className="text-blue-500" />
              <span className="flex-1 text-sm">Cloud Sync (Encrypted)</span>
              <button 
                onClick={() => setCloudSync(!cloudSync)}
                className={`w-11 h-6 rounded-full relative transition-colors ${cloudSync ? 'bg-blue-500' : 'bg-[#111128]'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${cloudSync ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center gap-3 p-4 bg-[#1a1a3e] rounded-xl">
              <ShieldCheck size={18} className="text-emerald-500" />
              <span className="flex-1 text-sm">Chiffrement AES-256</span>
              <span className="text-[10px] text-emerald-500 font-bold">ACTIF</span>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-[10px] font-bold text-[#6a6a99] uppercase tracking-widest px-1">Prédictions</h3>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 p-4 bg-[#1a1a3e] rounded-xl">
              <Bell size={18} className="text-[#7c3aed]" />
              <span className="flex-1 text-sm">Notifications</span>
              <div className="w-10 h-5 bg-[#7c3aed] rounded-full relative">
                <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-[#1a1a3e] rounded-xl">
              <Brain size={18} className="text-[#7c3aed]" />
              <span className="flex-1 text-sm">Précision IA</span>
              <span className="text-xs font-bold text-[#06b6d4]">68%</span>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-[10px] font-bold text-[#6a6a99] uppercase tracking-widest px-1">Données</h3>
          <div className="space-y-1.5">
            <div 
              onClick={() => {
                const data = JSON.stringify({ user, scores }, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = '6s_data_export.json';
                a.click();
              }}
              className="flex items-center gap-3 p-4 bg-[#1a1a3e] rounded-xl cursor-pointer active:scale-[0.98] transition-all"
            >
              <Download size={18} className="text-[#a0a0cc]" />
              <span className="flex-1 text-sm">Exporter mes données</span>
            </div>
            <div 
              onClick={() => {
                hapticFeedback('light');
                setShowResetConfirm(true);
              }}
              className="flex items-center gap-3 p-4 bg-[#1a1a3e] rounded-xl cursor-pointer active:scale-[0.98] transition-all text-red-400"
            >
              <Trash2 size={18} />
              <span className="flex-1 text-sm">Réinitialiser l'application</span>
            </div>
          </div>
        </section>

        <section className="pt-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#7c3aed]/20 to-[#3b82f6]/10 border border-[#7c3aed]/30 text-center">
            <Crown size={32} className="mx-auto text-amber-400 mb-3" />
            <h3 className="text-base font-bold mb-1">Passer à CLAIRVOYANCE</h3>
            <p className="text-[11px] text-[#a0a0cc] mb-4">20 tâches/mois + négociateur + prédictions J+90</p>
            <button className="w-full py-3 bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] rounded-xl font-bold text-sm">
              9,99€ / mois
            </button>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#1a1a3e] border border-red-500/30 rounded-[2rem] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Réinitialisation</h3>
              <p className="text-sm text-[#a0a0cc] mb-8">Voulez-vous vraiment effacer toutes vos données ? Cette action est irréversible.</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleReset}
                  className="w-full py-4 bg-red-500 rounded-2xl font-bold text-sm"
                >
                  Tout effacer
                </button>
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="w-full py-4 bg-white/5 rounded-2xl font-bold text-sm text-[#a0a0cc]"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showProfileModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#1a1a3e] border border-[#7c3aed]/30 rounded-[2rem] p-8 shadow-2xl overflow-y-auto max-h-[80vh]"
            >
              <button 
                onClick={() => setShowProfileModal(false)}
                className="absolute top-6 right-6 text-[#a0a0cc]"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-xl font-bold mb-6">Modifier le profil</h3>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-[10px] text-[#6a6a99] uppercase font-bold mb-1.5 block">Prénom</label>
                  <input 
                    value={editUser.name}
                    onChange={e => setEditUser({...editUser, name: e.target.value})}
                    className="w-full bg-[#0a0a1a] border border-[#7c3aed]/20 rounded-xl p-3 text-sm outline-none focus:border-[#7c3aed]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6a6a99] uppercase font-bold mb-1.5 block">Sommeil moyen (h)</label>
                  <input 
                    type="number"
                    value={editUser.sleep}
                    onChange={e => setEditUser({...editUser, sleep: parseInt(e.target.value)})}
                    className="w-full bg-[#0a0a1a] border border-[#7c3aed]/20 rounded-xl p-3 text-sm outline-none focus:border-[#7c3aed]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6a6a99] uppercase font-bold mb-1.5 block">Activité</label>
                  <select 
                    value={editUser.activity}
                    onChange={e => setEditUser({...editUser, activity: e.target.value as any})}
                    className="w-full bg-[#0a0a1a] border border-[#7c3aed]/20 rounded-xl p-3 text-sm outline-none focus:border-[#7c3aed]"
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Élevée</option>
                    <option value="athlete">Athlète</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#6a6a99] uppercase font-bold mb-1.5 block">Finance</label>
                  <select 
                    value={editUser.finance}
                    onChange={e => setEditUser({...editUser, finance: e.target.value as any})}
                    className="w-full bg-[#0a0a1a] border border-[#7c3aed]/20 rounded-xl p-3 text-sm outline-none focus:border-[#7c3aed]"
                  >
                    <option value="tight">Serrée</option>
                    <option value="ok">Correcte</option>
                    <option value="comfortable">Confortable</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleSaveProfile}
                className="w-full py-4 bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <Check size={18} /> Enregistrer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPinSetupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPinSetupModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#1a1a3e] border border-[#7c3aed]/30 rounded-[2rem] p-8 shadow-2xl"
            >
              <button 
                onClick={() => setShowPinSetupModal(false)}
                className="absolute top-6 right-6 text-[#a0a0cc] hover:text-white"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-xl font-bold mb-2">
                {pinStep === 'pin' ? 'Configurer un PIN' : 'Confirmer le PIN'}
              </h3>
              <p className="text-xs text-[#a0a0cc] mb-6">
                {pinStep === 'pin' ? 'Saisissez un code secret à 4 chiffres pour protéger vos données.' : 'Saisissez à nouveau votre code secret pour confirmer.'}
              </p>
              
              <div className="flex justify-center gap-4 mb-8">
                {[0, 1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                      newPinCode.length > i ? 'bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] border-[#7c3aed]' : 'border-[#7c3aed]/30'
                    }`} 
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                  <button 
                    key={n} 
                    onClick={() => {
                      if (newPinCode.length < 4) {
                        hapticFeedback('light');
                        setNewPinCode(prev => prev + n);
                      }
                    }}
                    className="w-full aspect-square rounded-full bg-white/5 border border-white/5 active:bg-white/10 flex items-center justify-center text-lg font-bold"
                  >
                    {n}
                  </button>
                ))}
                <button 
                  onClick={() => {
                    hapticFeedback('medium');
                    setNewPinCode('');
                  }}
                  className="w-full aspect-square rounded-full flex items-center justify-center text-[#6a6a99] text-xs font-semibold"
                >
                  Effacer
                </button>
                <button 
                  onClick={() => {
                    if (newPinCode.length < 4) {
                      hapticFeedback('light');
                      setNewPinCode(prev => prev + '0');
                    }
                  }}
                  className="w-full aspect-square rounded-full bg-white/5 border border-white/5 active:bg-white/10 flex items-center justify-center text-lg font-bold"
                >
                  0
                </button>
                <button 
                  onClick={() => {
                    hapticFeedback('light');
                    setNewPinCode(prev => prev.slice(0, -1));
                  }}
                  className="w-full aspect-square rounded-full flex items-center justify-center text-[#a0a0cc]"
                >
                  ⌫
                </button>
              </div>

              {newPinCode.length === 4 && (
                <button 
                  onClick={handleCreatePin}
                  className="w-full py-4 bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] rounded-2xl font-bold text-sm"
                >
                  {pinStep === 'pin' ? 'Continuer' : 'Enregistrer'}
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="text-center py-8 text-[10px] text-[#6a6a99] font-medium">
        SIXIÈME SENS v2.0.0 🔐 — © 2026
      </div>
    </div>
  );
};
