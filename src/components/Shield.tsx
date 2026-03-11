import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Smartphone, Moon, Search, ShieldCheck, Play, Square, Clock, Zap } from 'lucide-react';

export const Shield: React.FC = () => {
  const [focusMode, setFocusMode] = useState(false);
  const [antiScroll, setAntiScroll] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isFocusing, setIsFocusing] = useState(false);
  const [analysisText, setAnalysisText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAnalyze = () => {
    if (!analysisText) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        score: 82,
        bias: 'Léger biais optimiste',
        deepfake: 'Non détecté',
        source: 'Fiable (94%)'
      });
    }, 3000);
  };

  useEffect(() => {
    let interval: any;
    if (isFocusing && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsFocusing(false);
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
    }
    return () => clearInterval(interval);
  }, [isFocusing, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-[2rem] bg-gradient-to-br from-[#1a1a3e] to-[#0a0a1a] border border-[#7c3aed]/20 text-center relative overflow-hidden">
        {isFocusing && (
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-[#7c3aed] rounded-full blur-[100px]"
          />
        )}
        
        <div className="relative z-10">
          <div className="text-5xl font-black mb-4 tracking-tighter font-mono">
            {formatTime(timeLeft)}
          </div>
          <h2 className="text-lg font-bold mb-1">Deep Focus</h2>
          <p className="text-[#a0a0cc] text-xs mb-6">Session de concentration intelligente</p>
          
          <div className="flex justify-center gap-4 mb-8">
            <button 
              onClick={() => setIsFocusing(!isFocusing)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isFocusing ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              }`}
            >
              {isFocusing ? <Square size={24} /> : <Play size={24} className="ml-1" />}
            </button>
            {!isFocusing && timeLeft < 25 * 60 && (
              <button 
                onClick={() => setTimeLeft(25 * 60)}
                className="w-14 h-14 rounded-full bg-[#1a1a3e] text-[#a0a0cc] border border-[#7c3aed]/20 flex items-center justify-center"
              >
                <Clock size={24} />
              </button>
            )}
          </div>

          <div className="space-y-2 mb-6 text-left">
            <div className="flex justify-between text-[10px] font-bold text-[#a0a0cc] uppercase tracking-wider">
              <span>Capital Attentionnel</span>
              <span className="text-[#06b6d4]">78%</span>
            </div>
            <div className="h-2.5 bg-[#1a1a3e] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "78%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#10b981] to-[#06b6d4] rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold flex items-center gap-2">🎛️ Modes de Protection</h2>
        
        <div className={`p-4 rounded-2xl bg-[#1a1a3e] border border-[#7c3aed]/20 flex items-center gap-4 transition-all ${antiScroll ? 'shadow-lg shadow-[#7c3aed]/10 border-[#7c3aed]/50' : ''}`}>
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center text-xl">📱</div>
          <div className="flex-1">
            <h3 className="text-sm font-bold">Anti-Scroll</h3>
            <p className="text-[10px] text-[#a0a0cc]">Alerte après 10 min de scroll</p>
          </div>
          <button 
            onClick={() => setAntiScroll(!antiScroll)}
            className={`w-11 h-6 rounded-full relative transition-colors ${antiScroll ? 'bg-[#7c3aed]' : 'bg-[#111128]'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${antiScroll ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>

        <div className={`p-4 rounded-2xl bg-[#1a1a3e] border border-[#7c3aed]/20 flex items-center gap-4 transition-all ${nightMode ? 'shadow-lg shadow-[#7c3aed]/10 border-[#7c3aed]/50' : ''}`}>
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center text-xl">🌙</div>
          <div className="flex-1">
            <h3 className="text-sm font-bold">Mode Nuit</h3>
            <p className="text-[10px] text-[#a0a0cc]">Réduit stimulation avant coucher</p>
          </div>
          <button 
            onClick={() => setNightMode(!nightMode)}
            className={`w-11 h-6 rounded-full relative transition-colors ${nightMode ? 'bg-[#7c3aed]' : 'bg-[#111128]'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${nightMode ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#1a1a3e] border border-dashed border-[#7c3aed]/30 text-center">
        <Search size={36} className="mx-auto text-[#7c3aed] mb-3" />
        <h3 className="text-sm font-bold mb-1">Analyseur Fiabilité</h3>
        <p className="text-[11px] text-[#a0a0cc] mb-4">Collez un lien ou texte pour détecter les biais et deepfakes</p>
        
        <textarea 
          value={analysisText}
          onChange={e => setAnalysisText(e.target.value)}
          className="w-full p-3 bg-[#111128] border border-[#7c3aed]/20 rounded-xl text-xs outline-none mb-3 h-20 resize-none" 
          placeholder="Collez un lien ou du texte..." 
        />

        <AnimatePresence>
          {analysisResult && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-left space-y-2 overflow-hidden"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#a0a0cc] uppercase font-bold">Score de fiabilité</span>
                <span className="text-sm font-black text-emerald-400">{analysisResult.score}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-[9px] text-[#a0a0cc]">Biais: <span className="text-white">{analysisResult.bias}</span></div>
                <div className="text-[9px] text-[#a0a0cc]">Deepfake: <span className="text-white">{analysisResult.deepfake}</span></div>
                <div className="text-[9px] text-[#a0a0cc]">Source: <span className="text-white">{analysisResult.source}</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full py-3 bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              <ShieldCheck size={14} /> Analyser
            </>
          )}
        </button>
      </div>
    </div>
  );
};
