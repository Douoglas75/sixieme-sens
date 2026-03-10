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
import { BottomNav } from './components/BottomNav';
import { TopBar } from './components/TopBar';
import { AnimatePresence, motion } from 'motion/react';

const AppContent: React.FC = () => {
  const { isLocked, hasPin } = useSecurity();
  const { user, isLoading } = useApp();
  const [showSplash, setShowSplash] = useState(true);
  const [activePage, setActivePage] = useState<'home' | 'shield' | 'predictions' | 'social' | 'settings' | 'connections'>('home');

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;
  if (isLoading) return <SplashScreen />;

  if (!hasPin) return <Onboarding />;
  if (!user) return <Setup />;
  if (isLocked) return <LockScreen />;

  const renderPage = () => {
    switch (activePage) {
      case 'home': return <Dashboard />;
      case 'shield': return <Shield />;
      case 'predictions': return <Predictions />;
      case 'social': return <SocialRadar />;
      case 'settings': return <Settings onNavigate={setActivePage} />;
      case 'connections': return <Connections />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a1a] text-white overflow-hidden">
      <TopBar onSettings={() => setActivePage('settings')} />
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
