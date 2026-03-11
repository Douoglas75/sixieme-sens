import React, { useState } from 'react';
import { useSecurity } from '../contexts/SecurityContext';
import { motion } from 'motion/react';
import { Lock, Delete } from 'lucide-react';

import { hapticFeedback } from '../utils/haptics';

export const LockScreen: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const { unlock } = useSecurity();

  const handleKey = async (n: string) => {
    hapticFeedback('light');
    if (pin.length < 4) {
      const newPin = pin + n;
      setPin(newPin);
      if (newPin.length === 4) {
        const success = await unlock(newPin);
        if (!success) {
          hapticFeedback('error');
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 600);
        } else {
          hapticFeedback('success');
        }
      }
    }
  };

  const handleBackspace = () => {
    hapticFeedback('medium');
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a1a] flex flex-col items-center justify-center p-8 z-[9999]">
      <div className="text-6xl mb-6">🔐</div>
      <h2 className="text-xl font-bold mb-2">Entrez votre PIN</h2>
      <p className="text-[#a0a0cc] text-sm mb-12">Déverrouillez pour accéder à vos données</p>

      <div className={`flex gap-6 mb-12 ${error ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map(i => (
          <motion.div 
            key={i} 
            animate={pin.length > i ? { scale: 1.1 } : { scale: 1 }}
            className={`w-4 h-4 rounded-full border-2 transition-all ${
              error ? 'bg-red-500 border-red-500' : 
              pin.length > i ? 'bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] border-[#7c3aed]' : 'border-[#7c3aed]/50'
            }`} 
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button 
            key={n} 
            onClick={() => handleKey(n.toString())}
            className="w-20 h-20 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center text-2xl font-bold active:bg-[#7c3aed]/30 transition-colors"
          >
            {n}
          </button>
        ))}
        <div />
        <button 
          onClick={() => handleKey('0')}
          className="w-20 h-20 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center text-2xl font-bold active:bg-[#7c3aed]/30 transition-colors"
        >
          0
        </button>
        <button 
          onClick={handleBackspace}
          className="w-20 h-20 flex items-center justify-center text-[#6a6a99]"
        >
          <Delete size={24} />
        </button>
      </div>
    </div>
  );
};
