import React from 'react';
import { ScrollText, ChevronLeft } from 'lucide-react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-6 max-w-2xl mx-auto space-y-8 font-sans">
      <div className="flex items-center gap-3 border-b border-white/10 pb-6">
        <div className="p-3 bg-[#3b82f6]/10 rounded-full text-[#60a5fa]">
          <ScrollText size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conditions Générales d'Utilisation</h1>
          <p className="text-xs text-[#a0a0cc]">Dernière mise à jour : Juin 2026</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-[#d0d0ff]">
        En accédant et en utilisant l'application <strong>Sixième Sens (6S)</strong>, vous acceptez sans réserve les présentes 
        Conditions Générales d'Utilisation (CGU).
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-blue-300">1. Objet du Service</h2>
        <p className="text-xs leading-relaxed text-[#a0a0cc]">
          L'application Sixième Sens (6S) offre un assistant d'intelligence comportementale automatisé ("Ghost-Admin"), 
          un dispositif d'alertes temps réel de vos contacts et d'analyse des signaux biologiques (sommeil, activité) 
          visant à optimiser votre quotidien social et productif.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-blue-300">2. Intégrations Tierces (Google APIS)</h2>
        <p className="text-xs leading-relaxed text-[#a0a0cc]">
          L'application interagit avec les API de Google (Google Fit, Google Agenda) uniquement après votre consentement explicite de liaison. 
          L'utilisation de ces informations reçues des API de Google respecte les règles d'utilisation de données utilisateur de Google.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-blue-300">3. Absence de Responsabilité Médicale ou d'Urgence</h2>
        <p className="text-xs leading-relaxed text-[#a0a0cc]">
          Tout signal, indice réel de stress ou alerte sociale émis par Sixième Sens est une prédiction comportementale purement informative. 
          6S n'est pas un dispositif médical et ses analyses ne se substituent pas à l'avis d'un professionnel de santé.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-blue-300">4. Propriété Intellectuelle</h2>
        <p className="text-xs leading-relaxed text-[#a0a0cc]">
          L'application et son code d'intelligence prédictive sont protégés par le droit d'auteur. Tout usage commercial, revente ou désassemblage 
          sans accord préalable est formellement interdit.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-blue-300">5. Résiliation</h2>
        <p className="text-xs leading-relaxed text-[#a0a0cc]">
          Vous pouvez à tout moment résilier votre utilisation en effaçant vos données depuis l'écran Paramètres de l'application et en désinstallant l'application.
        </p>
      </section>

      <div className="pt-8 border-t border-white/5 flex justify-between items-center text-xs text-[#6a6a99]">
        <span>Sixième Sens (6S) Copyright © 2026</span>
        <button 
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold"
        >
          <ChevronLeft size={16} /> Retour à l'application
        </button>
      </div>
    </div>
  );
};
