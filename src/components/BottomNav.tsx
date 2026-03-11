import React from 'react';
import { Home, Shield, LineChart, Users, Settings } from 'lucide-react';

interface BottomNavProps {
  activePage: string;
  onPageChange: (page: any) => void;
}

import { hapticFeedback } from '../utils/haptics';

export const BottomNav: React.FC<BottomNavProps> = ({ activePage, onPageChange }) => {
  const items = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'shield', icon: Shield, label: 'Bouclier' },
    { id: 'predictions', icon: LineChart, label: 'Prédictions' },
    { id: 'social', icon: Users, label: 'Social' },
    { id: 'settings', icon: Settings, label: 'Réglages' }
  ];

  const handleNav = (id: string) => {
    hapticFeedback('light');
    onPageChange(id);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[calc(65px+env(safe-area-inset-bottom,34px))] pb-[env(safe-area-inset-bottom,34px)] bg-[#111128]/95 backdrop-blur-2xl border-t border-[#7c3aed]/15 flex items-center justify-around z-50">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => handleNav(item.id)}
          className={`flex flex-col items-center gap-1 px-4 py-2 transition-all relative ${
            activePage === item.id ? 'text-[#7c3aed]' : 'text-[#6a6a99]'
          }`}
        >
          <item.icon size={20} className={activePage === item.id ? 'scale-110' : ''} />
          <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
          {activePage === item.id && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-b-full" />
          )}
        </button>
      ))}
    </nav>
  );
};
