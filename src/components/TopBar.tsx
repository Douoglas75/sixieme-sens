import React, { useState } from 'react';
import { Bell, Settings as SettingsIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { NotificationCenter } from './NotificationCenter';
import { hapticFeedback } from '../utils/haptics';

interface TopBarProps {
  onSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSettings }) => {
  const { alerts, user } = useApp();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleNotif = () => {
    hapticFeedback('light');
    setIsNotifOpen(true);
  };

  const handleSettings = () => {
    hapticFeedback('light');
    onSettings();
  };

  return (
    <>
      <header className="px-5 py-3 pt-[env(safe-area-inset-top,44px)] bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-[#7c3aed]/10 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center">
            <img 
              src="icon-512.png" 
              alt="6S" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-black text-lg tracking-tighter bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] bg-clip-text text-transparent">6S</span>
          <span className="text-[8px] font-black bg-[#1a1a3e] text-[#06b6d4] px-2 py-0.5 rounded-full tracking-widest uppercase">Intuition</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleNotif}
            className="relative p-2.5 -m-1 text-[#a0a0cc] hover:text-[#7c3aed] transition-colors"
          >
            <Bell size={20} />
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center text-white border-2 border-[#0a0a1a]">
                {alerts.length}
              </span>
            )}
          </button>
          <button 
            onClick={handleSettings}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#7c3aed] border-2 border-[#7c3aed]/50 flex items-center justify-center text-xs font-bold active:scale-90 transition-all text-white"
          >
            {user?.name ? user.name[0].toUpperCase() : 'S'}
          </button>
        </div>
      </header>

      <NotificationCenter 
        isOpen={isNotifOpen} 
        onClose={() => setIsNotifOpen(false)} 
      />
    </>
  );
};
