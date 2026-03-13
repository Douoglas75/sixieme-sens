import React, { useState, useEffect } from 'react';
import { SecurityProvider, useSecurity } from './contexts/SecurityContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { SplashScreen } from './components/SplashScreen';
import { Onboarding } from './components/Onboarding';
import { Setup } from './components/Setup';
import { LockScreen } from './components/LockScreen';
import { Dashboard } from './components/Dashboard';
import { Shield } from './components/Shield';
import { Predictions } from './components/Predictions';
import { SocialRadar } from './components/SocialRadar';
import { Settings } from './components/Settings';
import { Connections } from './components/Connections';
import { GhostAdmin } from './components/GhostAdmin';
import { Statistics } from './components/Statistics';
import { BottomNav } from './components/BottomNav';
import { TopBar } from './components/TopBar';
import { AnimatePresence, motion } from 'motion/react';

import { SystemStatus } from './components/SystemStatus';
import { WifiOff } from 'lucide-react';
import { useBackgroundTasks } from './hooks/useBackgroundTasks';

const AppContent: React.FC = () => {
  const { isLocked, hasPin } = useSecurity();
  const { user, isLoading } = useApp();
  const [showSplash, setShowSplash] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activePage, setActivePage] = useState<'home' | 'shield' | 'predictions' | 'social' | 'settings' | 'connections' | 'ghost' | 'statistics'>('home');

  // Initialize Background Tasks
  useBackgroundTasks();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showSplash) return <SplashScreen />;
  if (isLoading) return <SplashScreen />;

  if (!hasPin) return <Onboarding />;
  if (!user) return <Setup />;
  if (isLocked) return <LockScreen />;

  const renderPage = () => {
    switch (activePage) {
      case 'home': return (
        <div className="space-y-6">
          <Dashboard onNavigate={setActivePage} />
          <SystemStatus />
        </div>
      );
      case 'shield': return <Shield />;
      case 'predictions': return <Predictions />;
      case 'social': return <SocialRadar />;
      case 'settings': return <Settings onNavigate={setActivePage} />;
      case 'connections': return <Connections />;
      case 'ghost': return <GhostAdmin onBack={() => setActivePage('home')} />;
      case 'statistics': return <Statistics onBack={() => setActivePage('home')} />;
      default: return <Dashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a1a] text-white overflow-hidden">
      <TopBar onSettings={() => setActivePage('settings')} />
      
      {!isOnline && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 flex items-center justify-center gap-2"
        >
          <WifiOff className="w-4 h-4 text-amber-500" />
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Offline Mode — Using Local Intelligence</span>
        </motion.div>
      )}

      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-4"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav activePage={activePage} onPageChange={setActivePage} />
    </div>
  );
};

export default function App() {
  return (
    <SecurityProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SecurityProvider>
  );
}
