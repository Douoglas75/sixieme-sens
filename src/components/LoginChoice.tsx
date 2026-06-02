import React from 'react';
import { motion } from 'motion/react';
import { Shield, Globe, Lock, ChevronRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface LoginChoiceProps {
  onChoice: (choice: 'local' | 'google' | 'demo') => void;
}

export const LoginChoice: React.FC<LoginChoiceProps> = ({ onChoice }) => {
  const { linkApp } = useApp();

  const handleGoogleLogin = () => {
    // In a real app, this would trigger the Google OAuth flow for authentication.
    // For now, we proceed to the app and let the user link services manually.
    onChoice('google');
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a1a] flex flex-col items-center justify-center p-8 z-[5000]">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] rounded-3xl overflow-hidden mx-auto mb-6 shadow-xl shadow-[#7c3aed]/20">
          <img 
            src="icon-512.png" 
            alt="6S Logo" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="text-3xl font-black mb-2 tracking-tight">Portail d'Accès</h2>
        <p className="text-[#a0a0cc] text-sm max-w-xs mx-auto">
          Choisissez votre méthode de connexion sécurisée pour accéder à votre Sixième Sens.
        </p>
      </motion.div>

      <div className="w-full max-w-sm space-y-4">
        <button 
          onClick={() => onChoice('demo')}
          className="w-full p-6 bg-gradient-to-r from-[#201c4e] to-[#251b3e] border border-cyan-500/30 rounded-2xl flex items-center gap-4 hover:border-cyan-400 transition-all group"
        >
          <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 font-bold text-lg">
            ✨
          </div>
          <div className="flex-1 text-left">
            <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">Démo d'Accès Direct</div>
            <div className="text-[10px] text-[#a0a0cc]">Accéder directement à l'application sans configuration ni compte.</div>
          </div>
          <ChevronRight size={16} className="text-[#6a6a99]" />
        </button>

        <button 
          onClick={() => onChoice('local')}
          className="w-full p-5 bg-[#1a1a3e]/60 border border-[#7c3aed]/30 rounded-2xl flex items-center gap-4 hover:bg-[#1a1a3e]/80 transition-all group"
        >
          <div className="w-12 h-12 bg-[#7c3aed]/20 rounded-xl flex items-center justify-center text-[#7c3aed]">
            <Lock size={24} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-bold text-white group-hover:text-[#7c3aed] transition-colors">Compte Local (PIN)</div>
            <div className="text-[10px] text-[#a0a0cc]">Données chiffrées localement sur cet appareil.</div>
          </div>
          <ChevronRight size={16} className="text-[#6a6a99]" />
        </button>

        <button 
          onClick={handleGoogleLogin}
          className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all group"
        >
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <Globe size={24} className="text-blue-400" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-bold text-white group-hover:text-blue-400 transition-colors">Connexion Google</div>
            <div className="text-[10px] text-[#a0a0cc]">Synchronisation cloud et accès multi-appareils.</div>
          </div>
          <ChevronRight size={16} className="text-[#6a6a99]" />
        </button>
      </div>

      <p className="mt-12 text-[10px] text-[#6a6a99] text-center max-w-xs leading-relaxed">
        En vous connectant, vous acceptez le protocole de confidentialité 6S. Vos données biométriques ne sont jamais vendues à des tiers.
      </p>
    </div>
  );
};
