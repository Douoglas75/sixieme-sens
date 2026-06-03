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
    <div className="min-h-screen bg-[#0a0a1a] text-white flex flex-col items-center justify-start p-6 overflow-y-auto font-sans pb-16">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mt-8 mb-10 max-w-md"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] rounded-3xl overflow-hidden mx-auto mb-5 shadow-xl shadow-[#7c3aed]/20">
          <img 
            src="icon-512.png" 
            alt="6S Logo" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        {/* Prominent exact app names as configured in console to satisfy Google verification */}
        <h2 className="text-3xl font-black mb-1.5 tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
          Sixèmes sens
        </h2>
        <p className="text-[10px] uppercase font-bold tracking-widest text-[#a0a0cc] mb-4">
          (Conçu sous la marque Sixième Sens / 6S)
        </p>

        <p className="text-[#a0a0cc] text-xs leading-relaxed max-w-sm mx-auto px-4">
          Choisissez votre méthode de connexion pour débloquer votre assistant d'anticipation cognitive et automatiser vos tâches quotidiennes.
        </p>
      </motion.div>

      {/* Goal Explanation Block strictly requested by Google OAuth team */}
      <div className="w-full max-w-md bg-[#131330] rounded-3xl p-5 border border-purple-500/10 mb-8 space-y-3.5 shadow-xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          🎯 Objectif de l'application
        </h3>
        <p className="text-[11px] text-[#a0a0cc] leading-relaxed">
          <strong>Sixèmes sens</strong> est un tableau de bord intelligent conçu pour analyser vos signaux biologiques et optimiser la planification de votre emploi du temps :
        </p>
        <div className="space-y-2.5 text-[10.5px]">
          <div className="flex gap-2.5 items-start">
            <span className="text-purple-400 font-extrabold mt-0.5">▪</span>
            <p className="text-[#a0a0cc]">
              <strong>Analyse Physiologique (Google Fit):</strong> Récupère vos données de pas et vos durées de sommeil pour déterminer de potentielles baisses de forme physique et évaluer votre fatigue.
            </p>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="text-[#3b82f6] font-extrabold mt-0.5">▪</span>
            <p className="text-[#a0a0cc]">
              <strong>Assistant d'Agenda (Google Calendar):</strong> Connecte votre calendrier pour organiser vos rappels de récupération physique, prévenir des surcharges d'événements et programmer l'assistant d'automatisation Ghost-Admin.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md space-y-3.5 font-sans">
        <button 
          onClick={() => onChoice('demo')}
          className="w-full p-5 bg-gradient-to-r from-[#201c4e] to-[#251b3e] border border-cyan-500/30 rounded-2xl flex items-center gap-4 hover:border-cyan-400 transition-all group"
        >
          <div className="w-11 h-11 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 font-bold text-lg">
            ✨
          </div>
          <div className="flex-1 text-left">
            <div className="font-bold text-sm text-white group-hover:text-cyan-400 transition-colors">Démo d'Accès Direct</div>
            <div className="text-[10px] text-[#a0a0cc]">Accéder directement à l'application sans configuration ni compte.</div>
          </div>
          <ChevronRight size={16} className="text-[#6a6a99]" />
        </button>

        <button 
          onClick={() => onChoice('local')}
          className="w-full p-5 bg-[#1a1a3e]/60 border border-[#7c3aed]/30 rounded-2xl flex items-center gap-4 hover:bg-[#1a1a3e]/80 transition-all group"
        >
          <div className="w-11 h-11 bg-[#7c3aed]/20 rounded-xl flex items-center justify-center text-[#7c3aed]">
            <Lock size={20} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-bold text-sm text-white group-hover:text-[#7c3aed] transition-colors">Compte Local (PIN)</div>
            <div className="text-[10px] text-[#a0a0cc]">Données chiffrées localement sur cet appareil.</div>
          </div>
          <ChevronRight size={16} className="text-[#6a6a99]" />
        </button>

        <button 
          onClick={handleGoogleLogin}
          className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all group"
        >
          <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center">
            <Globe size={20} className="text-blue-400" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">Connexion Google</div>
            <div className="text-[10px] text-[#a0a0cc]">Synchronisation cloud et accès multi-appareils.</div>
          </div>
          <ChevronRight size={16} className="text-[#6a6a99]" />
        </button>
      </div>

      <div className="mt-12 text-[10px] text-[#6a6a99] text-center max-w-sm leading-relaxed space-y-4">
        <p>
          En vous connectant, vous acceptez le protocole de confidentialité de <strong>Sixèmes sens</strong>. Vos données biométriques et de calendrier restent chiffrées de bout en bout et ne sont jamais vendues à des tiers.
        </p>
        <div className="flex justify-center items-center gap-4 text-purple-400 font-semibold underline">
          <a href="/privacy" className="hover:text-purple-300">Charte de Confidentialité</a>
          <span>•</span>
          <a href="/terms" className="hover:text-purple-300">Conditions Générales d'Utilisation</a>
        </div>
      </div>
    </div>
  );
};
