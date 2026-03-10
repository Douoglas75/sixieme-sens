import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSecurity } from '../contexts/SecurityContext';

const slides = [
  { icon: '🧠', title: 'Développez votre Sixième Sens', desc: "L'IA qui anticipe vos problèmes avant qu'ils n'arrivent." },
  { icon: '⚡', title: '3 Alertes Prédictives / Jour', desc: 'Santé, finance, relations... prédictions personnalisées.' },
  { icon: '🛡️', title: 'Bouclier Cognitif', desc: 'Protégez votre attention, détectez les deepfakes.' },
  { icon: '👥', title: 'Radar Social', desc: 'Ne perdez plus le contact avec vos 5 relations clés.' },
  { icon: '🤖', title: 'Ghost-Admin', desc: '2 tâches administratives automatisées par mois.' }
];

export const Onboarding: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'pin' | 'confirm'>('pin');
  const { setupPin } = useSecurity();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setShowPinSetup(true);
    }
  };

  const handlePinSubmit = async (p: string) => {
    if (step === 'pin') {
      setConfirmPin(p);
      setPin('');
      setStep('confirm');
    } else {
      if (p === confirmPin) {
        await setupPin(p);
      } else {
        alert('Les PIN ne correspondent pas');
        setPin('');
        setStep('pin');
      }
    }
  };

  if (showPinSetup) {
    return (
      <div className="fixed inset-0 bg-[#0a0a1a] flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-2">{step === 'pin' ? 'Créez votre PIN' : 'Confirmez votre PIN'}</h2>
        <p className="text-[#a0a0cc] text-sm text-center mb-8">Ce PIN protège toutes vos données chiffrées.</p>
        
        <div className="flex gap-4 mb-12">
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full border-2 border-[#7c3aed]/50 transition-all ${pin.length > i ? 'bg-[#7c3aed] scale-110' : ''}`} 
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button 
              key={n} 
              onClick={() => pin.length < 4 && setPin(prev => prev + n)}
              className="w-20 h-20 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center text-2xl font-bold active:bg-[#7c3aed]/30 transition-colors"
            >
              {n}
            </button>
          ))}
          <div />
          <button 
            onClick={() => pin.length < 4 && setPin(prev => prev + '0')}
            className="w-20 h-20 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center text-2xl font-bold active:bg-[#7c3aed]/30 transition-colors"
          >
            0
          </button>
          <button 
            onClick={() => setPin(prev => prev.slice(0, -1))}
            className="w-20 h-20 flex items-center justify-center text-sm font-bold text-[#6a6a99]"
          >
            ⌫
          </button>
        </div>

        {pin.length === 4 && (
          <button 
            onClick={() => handlePinSubmit(pin)}
            className="mt-12 w-full py-4 bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] rounded-xl font-bold shadow-lg shadow-[#7c3aed]/40"
          >
            Continuer
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0a0a1a] flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8"
          >
            <div className="text-8xl mb-8 animate-bounce">{slides[currentSlide].icon}</div>
            <h2 className="text-2xl font-black text-center mb-4 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] bg-clip-text text-transparent">
              {slides[currentSlide].title}
            </h2>
            <p className="text-[#a0a0cc] text-center leading-relaxed max-w-xs">
              {slides[currentSlide].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-8">
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${currentSlide === i ? 'w-6 bg-[#7c3aed]' : 'w-2 bg-[#1a1a3e]'}`} 
            />
          ))}
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowPinSetup(true)}
            className="flex-1 py-4 bg-[#1a1a3e] text-[#a0a0cc] rounded-xl font-semibold"
          >
            Passer
          </button>
          <button 
            onClick={nextSlide}
            className="flex-1 py-4 bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white rounded-xl font-bold shadow-lg shadow-[#7c3aed]/40"
          >
            {currentSlide === slides.length - 1 ? 'Commencer' : 'Suivant'}
          </button>
        </div>
      </div>
    </div>
  );
};
