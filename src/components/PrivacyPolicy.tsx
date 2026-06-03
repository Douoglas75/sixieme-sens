import React from 'react';
import { Shield, ChevronLeft } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-6 max-w-2xl mx-auto space-y-8 font-sans">
      <div className="flex items-center gap-3 border-b border-white/10 pb-6">
        <div className="p-3 bg-[#7c3aed]/10 rounded-full text-[#c084fc]">
          <Shield size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Charte de Confidentialité</h1>
          <p className="text-xs text-[#a0a0cc]">Dernière mise à jour : Juin 2026</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-[#d0d0ff]">
        La protection de votre vie privée et de vos données personnelles est au cœur de l'architecture de l'application 
        <strong> Sixième Sens (6S)</strong>. Vos données de capteurs, de pas, d'agenda et d'activité sont traitées avec des technologies de pointe.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-purple-300">1. Collecte et Origine des Données</h2>
        <p className="text-xs leading-relaxed text-[#a0a0cc]">
          Pour vous offrir des prédictions d'intelligence comportementale et des analyses de vos contacts, nous vous invitons à lier en toute sécurité vos comptes 
          <strong> Google Fit</strong> et <strong>Google Agenda</strong>. L'application récupère exclusivement :
        </p>
        <ul className="list-disc pl-5 text-xs text-[#a0a0cc] space-y-1">
          <li>Le nombre de pas quotidiens et les durées d'activité physique.</li>
          <li>Les titres, horaires et événements planifiés dans vos agendas.</li>
          <li>Les métadonnées basiques requises par l'assistant automatisé Ghost-Admin.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-purple-300">2. Utilisation et Traitement Locale</h2>
        <p className="text-xs leading-relaxed text-[#a0a0cc]">
          Conformément à notre philosophie "Local Intelligence", l'essentiel de l'apprentissage machine et du traitement des alertes est réalisé 
          directement sur votre smartphone ou dans des bacs à sable (sandbox) cloud de serveurs hautement sécurisés.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-purple-300">3. Chiffrement AES-256 de bout en bout</h2>
        <p className="text-xs leading-relaxed text-[#a0a0cc]">
          Toutes les informations persistées localement dans votre application ou synchronisées sont chiffrées à l'aide d'une clé AES-256 unique 
          générée à partir de votre code PIN optionnel. Aucune entité tierce, y compris notre équipe, ne peut lire votre profil utilisateur en clair.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-purple-300">4. Vos Droits d'Accès et de Suppression</h2>
        <p className="text-xs leading-relaxed text-[#a0a0cc]">
          Vous détenez le contrôle total de vos données. À tout moment, dans l'onglet <strong>Paramètres</strong> de l'application, 
          vous pouvez exporter l'intégralité de vos informations (format JSON) ou réinitialiser de manière irréversible tous vos tokens et données historiques.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-purple-300">5. Contact</h2>
        <p className="text-xs leading-relaxed text-[#a0a0cc]">
          Pour toute question, vous pouvez contacter notre équipe à l'adresse support : <strong>littled971@gmail.com</strong>.
        </p>
      </section>

      <div className="pt-8 border-t border-white/5 flex justify-between items-center text-xs text-[#6a6a99]">
        <span>Sixième Sens (6S) Copyright © 2026</span>
        <button 
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-semibold"
        >
          <ChevronLeft size={16} /> Retour à l'application
        </button>
      </div>
    </div>
  );
};
