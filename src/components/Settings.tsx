import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useSecurity } from '../contexts/SecurityContext';
import { User, Watch, Bell, Clock, Brain, Lock, ShieldCheck, Download, Trash2, Crown, ChevronRight } from 'lucide-react';

interface SettingsProps {
  onNavigate: (page: any) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const { lock } = useSecurity();
  const { user } = useApp();

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
            <div className="flex items-center gap-3 p-4 bg-[#1a1a3e] rounded-xl cursor-pointer active:scale-[0.98] transition-all">
              <User size={18} className="text-[#7c3aed]" />
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
          <h3 className="text-[10px] font-bold text-[#6a6a99] uppercase tracking-widest px-1">Sécurité</h3>
          <div className="space-y-1.5">
            <div 
              onClick={lock}
              className="flex items-center gap-3 p-4 bg-[#1a1a3e] rounded-xl cursor-pointer active:scale-[0.98] transition-all"
            >
              <Lock size={18} className="text-amber-500" />
              <span className="flex-1 text-sm">Verrouiller la session</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-[#1a1a3e] rounded-xl cursor-pointer active:scale-[0.98] transition-all">
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
              <Clock size={18} className="text-[#7c3aed]" />
              <span className="flex-1 text-sm">Heures calmes</span>
              <ChevronRight size={16} className="text-[#6a6a99]" />
            </div>
            <div className="flex items-center gap-3 p-4 bg-[#1a1a3e] rounded-xl">
              <Brain size={18} className="text-[#7c3aed]" />
              <span className="flex-1 text-sm">Précision IA</span>
              <span className="text-xs font-bold text-[#06b6d4]">68%</span>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-[10px] font-bold text-[#6a6a99] uppercase tracking-widest px-1">Vie privée</h3>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 p-4 bg-[#1a1a3e] rounded-xl">
              <Download size={18} className="text-[#7c3aed]" />
              <span className="flex-1 text-sm">Exporter mes données</span>
              <ChevronRight size={16} className="text-[#6a6a99]" />
            </div>
            <div className="flex items-center gap-3 p-4 bg-[#1a1a3e] rounded-xl text-red-500">
              <Trash2 size={18} />
              <span className="flex-1 text-sm">Supprimer mon compte</span>
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

      <div className="text-center py-8 text-[10px] text-[#6a6a99] font-medium">
        SIXIÈME SENS v2.0.0 🔐 — © 2026
      </div>
    </div>
  );
};
