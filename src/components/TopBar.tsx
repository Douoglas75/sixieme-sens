import React from 'react';
import { Bell } from 'lucide-react';

interface TopBarProps {
  onSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSettings }) => {
  return (
    <header className="px-5 py-3 pt-[env(safe-area-inset-top,44px)] bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-[#7c3aed]/10 flex items-center justify-between z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center text-sm">👁️</div>
        <span className="font-black text-lg tracking-tighter bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] bg-clip-text text-transparent">6S</span>
        <span className="text-[8px] font-black bg-[#1a1a3e] text-[#06b6d4] px-2 py-0.5 rounded-full tracking-widest uppercase">Intuition</span>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-[#a0a0cc]">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center text-white">3</span>
        </button>
        <button 
          onClick={onSettings}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#7c3aed] border-2 border-[#7c3aed]/50 flex items-center justify-center text-xs font-bold"
        >
          S
        </button>
      </div>
    </header>
  );
};
