import React, { useState, useEffect } from 'react';
import { Shield, Cpu, RefreshCw, Cloud, Bell, Wifi, WifiOff, CheckCircle2, XCircle } from 'lucide-react';

interface StatusItem {
  label: string;
  icon: React.ReactNode;
  status: 'active' | 'inactive' | 'loading';
}

export const SystemStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swStatus, setSwStatus] = useState<'active' | 'inactive' | 'loading'>('loading');
  const [pushStatus, setPushStatus] = useState<'active' | 'inactive' | 'loading'>('loading');
  const [syncStatus, setSyncStatus] = useState<'active' | 'inactive' | 'loading'>('loading');

  const [hapticStatus, setHapticStatus] = useState<'active' | 'inactive'>('inactive');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => setSwStatus('active')).catch(() => setSwStatus('inactive'));
    } else {
      setSwStatus('inactive');
    }

    // Check Notifications
    if ('Notification' in window) {
      if (Notification.permission === 'granted') setPushStatus('active');
      else if (Notification.permission === 'denied') setPushStatus('inactive');
      else setPushStatus('loading');
    } else {
      setPushStatus('inactive');
    }

    // Check Sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      setSyncStatus('active');
    } else {
      setSyncStatus('inactive');
    }

    // Check Haptics
    if ('vibrate' in navigator) setHapticStatus('active');
    else setHapticStatus('inactive');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const statuses: StatusItem[] = [
    { label: 'Service Worker', icon: <Shield className="w-5 h-5" />, status: swStatus },
    { label: 'Intelligence Logic', icon: <Cpu className="w-5 h-5" />, status: 'active' },
    { label: 'Periodic Sync', icon: <RefreshCw className="w-5 h-5" />, status: syncStatus },
    { label: 'Background Sync', icon: <Cloud className="w-5 h-5" />, status: syncStatus },
    { label: 'Push Notifications', icon: <Bell className="w-5 h-5" />, status: pushStatus },
    { label: 'Haptic Engine', icon: <Cpu className="w-5 h-5" />, status: hapticStatus },
  ];

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') setPushStatus('active');
      else setPushStatus('inactive');
    }
  };

  return (
    <div className="bg-[#1a1a3e]/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">System Architecture</h3>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {isOnline ? 'Online' : 'Offline Mode'}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {statuses.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className={`p-3 rounded-full mb-3 ${
              item.status === 'active' ? 'bg-[#7c3aed]/20 text-[#7c3aed]' : 
              item.status === 'loading' ? 'bg-amber-500/20 text-amber-500' : 
              'bg-white/5 text-white/30'
            }`}>
              {item.icon}
            </div>
            <span className="text-[11px] font-medium text-white/60 mb-1">{item.label}</span>
            <div className="flex items-center gap-1">
              {item.status === 'active' ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              ) : item.status === 'loading' ? (
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              ) : (
                <XCircle className="w-3 h-3 text-white/20" />
              )}
              <span className={`text-[10px] font-bold uppercase ${
                item.status === 'active' ? 'text-emerald-500' : 
                item.status === 'loading' ? 'text-amber-500' : 
                'text-white/20'
              }`}>
                {item.status === 'active' ? 'Ready' : item.status === 'loading' ? 'Pending' : 'N/A'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {pushStatus === 'loading' && (
        <button 
          onClick={requestNotifications}
          className="w-full mt-6 py-3 bg-[#7c3aed] hover:bg-[#6d28d9] rounded-xl text-sm font-bold transition-all active:scale-95"
        >
          Enable Push Notifications
        </button>
      )}
    </div>
  );
};
