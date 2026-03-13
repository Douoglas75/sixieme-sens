import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ScoreData, Prediction, Alert, GhostTask, Device, AppConnection, Permission } from '../types';
import { useSecurity } from './SecurityContext';
import { PERMS_DATA, DEVICES_DATA, APPS_DATA } from '../constants';

import { generatePersonalizedInsights } from '../services/geminiService';
import { dataIntelligence, RealTimeData } from '../services/dataIntelligence';

interface AppContextType {
  user: User | null;
  setUser: (user: User) => void;
  scores: ScoreData | null;
  alerts: Alert[];
  predictions: Prediction[];
  ghostTasks: GhostTask[];
  devices: Device[];
  apps: AppConnection[];
  permissions: Permission[];
  liveData: RealTimeData[];
  togglePermission: (id: string) => void;
  connectDevice: (id: string) => void;
  addDevice: (device: Device) => void;
  linkApp: (id: string) => void;
  addContact: (contact: any) => void;
  requestGhostTask: (taskName: string) => Promise<void>;
  removeAlert: (id: string) => void;
  addAlert: (alert: Alert) => void;
  dismissPrediction: (id: string) => void;
  syncBluetoothDevices: () => Promise<void>;
  isLoading: boolean;
  isGenerating: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLocked, encrypt, decrypt } = useSecurity();
  const [user, setUserState] = useState<User | null>(null);
  const [scores, setScores] = useState<ScoreData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [ghostTasks, setGhostTasks] = useState<GhostTask[]>([]);
  const [devices, setDevices] = useState<Device[]>(DEVICES_DATA);
  const [apps, setApps] = useState<AppConnection[]>(APPS_DATA);
  const [permissions, setPermissions] = useState<Permission[]>(PERMS_DATA);
  const [liveData, setLiveData] = useState<RealTimeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Subscribe to real-time data
  useEffect(() => {
    const unsubscribe = dataIntelligence.subscribe((data) => {
      setLiveData(prev => [data, ...prev].slice(0, 50));
    });
    return unsubscribe;
  }, []);

  // Update data stream based on connections
  useEffect(() => {
    const connectedDevices = devices.filter(d => d.connected).map(d => d.id);
    const connectedApps = apps.filter(a => a.linked).map(a => a.id);
    dataIntelligence.startDataStream(connectedDevices, connectedApps);
    return () => dataIntelligence.stopDataStream();
  }, [devices, apps]);

  const removeAlert = (title: string) => {
    setAlerts(prev => prev.filter(a => a.title !== title));
  };

  const addAlert = (alert: Alert) => {
    setAlerts(prev => [alert, ...prev.slice(0, 9)]);
    
    // Real browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alert.title, {
        body: alert.desc,
        icon: '/icon-192.png'
      });
    }
  };

  const analyzeConnection = (item: Device | AppConnection) => {
    if (item.difficulty === 'hard') {
      addAlert({
        title: 'Connexion Complexe',
        desc: `L'intégration avec ${item.name} est instable en raison de restrictions API tierces. La récupération des données peut être intermittente.`,
        type: 'yellow',
        icon: '⚠️',
        time: 'À l\'instant',
        actions: ['En savoir plus']
      });
    } else if (item.difficulty === 'easy') {
      addAlert({
        title: 'Intégration Optimale',
        desc: `${item.name} utilise des protocoles standard. La connexion sera stable même après les mises à jour de l'application tierce.`,
        type: 'green',
        icon: '🛡️',
        time: 'À l\'instant',
        actions: []
      });
    }
  };

  const dismissPrediction = (id: string) => {
    setPredictions(prev => prev.filter(p => p.id !== id));
  };

  const setUser = async (newUser: User) => {
    setUserState(newUser);
    if (!isLocked) {
      const encrypted = await encrypt(newUser);
      localStorage.setItem('6s_user_data', encrypted);
      
      try {
        await fetch('/api/user/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'default_user', data: encrypted })
        });
      } catch (e) {
        console.error('Failed to sync with backend', e);
      }
      
      calculateRealScores(newUser);
      updateInsights(newUser);
    }
  };

  const updateInsights = async (userData: User) => {
    setIsGenerating(true);
    try {
      const { alerts: newAlerts, predictions: newPredictions } = await generatePersonalizedInsights(userData);
      setAlerts(newAlerts);
      setPredictions(newPredictions);
    } catch (error) {
      console.error("Failed to update insights", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockData = () => {
    const defaultUser: User = {
      name: 'Utilisateur',
      sleep: 7,
      activity: 'medium',
      finance: 'ok',
      contacts: [
        { name: 'Sarah L.', relation: 'Ami', lastContact: 2 },
        { name: 'Marc D.', relation: 'Famille', lastContact: 15 },
        { name: 'Julie V.', relation: 'Collègue', lastContact: 30 }
      ]
    };
    setUser(defaultUser);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!isLocked) {
          let encryptedUser = null;
          try {
            // Add a timeout to the fetch to prevent hanging in APK/Offline mode
            let signal = null;
            let timeoutId = null;
            
            if (typeof AbortController !== 'undefined') {
              const controller = new AbortController();
              timeoutId = setTimeout(() => controller.abort(), 2000);
              signal = controller.signal;
            }
            
            const res = await fetch('/api/user/load/default_user', { signal });
            if (timeoutId) clearTimeout(timeoutId);
            
            if (res.ok) {
              const { data } = await res.json();
              encryptedUser = data;
            }
          } catch (e) {
            console.warn('Backend unreachable or timed out, using local storage.', e);
          }

          if (!encryptedUser) {
            encryptedUser = localStorage.getItem('6s_user_data');
          }

          if (encryptedUser) {
            try {
              const decrypted = await decrypt(encryptedUser);
              setUserState(decrypted);
              calculateRealScores(decrypted);
              updateInsights(decrypted);
            } catch (e) {
              console.error('Failed to decrypt user data', e);
            }
          } else {
            generateMockData();
          }
        }
      } catch (error) {
        console.error('Critical error during data load:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isLocked]);

  useEffect(() => {
    if (!user || isLocked) return;

    const intelligenceInterval = setInterval(() => {
      const connectedDevices = devices.filter(d => d.connected).length;
      const connectedApps = apps.filter(a => a.linked).length;

      // Only generate dynamic alerts if we have active data sources
      if (connectedDevices > 0 || connectedApps > 0) {
        const randomChance = Math.random();
        if (randomChance > 0.95) {
          addAlert({
            title: 'Optimisation Détectée',
            desc: 'L\'IA a identifié une opportunité d\'économie sur vos abonnements.',
            type: 'green',
            icon: '💰',
            time: 'À l\'instant',
            actions: ['Voir détails']
          });
        }
      }
    }, 60000); // Every minute

    return () => clearInterval(intelligenceInterval);
  }, [user, isLocked, devices, apps]);

  const calculateRealScores = (userData: User) => {
    // Use data intelligence for more reliable stats if we have data
    const analyzedScores = dataIntelligence.analyzeData(liveData);
    
    const healthBase = userData.sleep >= 7 ? 8.5 : 6.0;
    const activityBonus = userData.activity === 'athlete' ? 1.5 : userData.activity === 'high' ? 1.0 : 0.5;
    const financeBase = userData.finance === 'comfortable' ? 9.0 : userData.finance === 'ok' ? 7.0 : 5.0;
    const socialBase = userData.contacts.length > 10 ? 8.5 : userData.contacts.length > 5 ? 7.0 : 5.0;
    
    const cognitiveBase = 7.5;
    const careerBase = 7.0;
    const adminBase = 8.0;

    const mockScores: ScoreData = {
      h: ((parseFloat(analyzedScores.h) + healthBase + activityBonus) / 2).toFixed(1),
      f: ((parseFloat(analyzedScores.f) + financeBase) / 2).toFixed(1),
      s: socialBase.toFixed(1),
      c: cognitiveBase.toFixed(1),
      k: careerBase.toFixed(1),
      a: adminBase.toFixed(1),
      t: '0.0'
    };

    const total = (
      Object.values(mockScores)
        .filter(v => !isNaN(parseFloat(v)))
        .reduce((acc, v) => acc + parseFloat(v), 0) / 6
    ).toFixed(1);
    
    mockScores.t = total;
    setScores(mockScores);

    setGhostTasks([
      { id: '1', icon: '📊', bg: 'rgba(59,130,246,.15)', title: 'Audit Assurances', desc: 'Analyse en cours...', st: 'progress', stl: '⏳ En cours' },
      { id: '2', icon: '📅', bg: 'rgba(16,185,129,.15)', title: 'Disponible', desc: 'Sélectionnez une tâche.', st: 'available', stl: '🟢 Dispo' }
    ]);
  };

  const addContact = (contact: any) => {
    if (user) {
      const newUser = { ...user, contacts: [...user.contacts, contact] };
      setUser(newUser);
    }
  };

  const requestGhostTask = async (taskName: string) => {
    const taskId = Date.now().toString();
    const newTask: GhostTask = { 
      id: taskId, 
      icon: '🤖', 
      bg: 'rgba(124,58,237,.15)', 
      title: taskName, 
      desc: 'Initialisation de l\'agent...', 
      st: 'progress', 
      stl: '⏳ Initialisation',
      progress: 0
    };

    setGhostTasks(prev => [newTask, ...prev.filter(t => t.st !== 'available')]);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setGhostTasks(prev => prev.map(t => t.id === taskId ? { 
          ...t, 
          st: 'completed', 
          stl: '✅ Terminé', 
          progress: 100,
          desc: 'Analyse terminée. Recommandations appliquées.',
          sav: 'Optimisation de 12% détectée'
        } : t));
      } else {
        setGhostTasks(prev => prev.map(t => t.id === taskId ? { 
          ...t, 
          progress: currentProgress,
          desc: `Analyse en cours... ${Math.round(currentProgress)}%`,
          stl: '⏳ En cours'
        } : t));
      }
    }, 800);
  };

  const togglePermission = (id: string) => {
    setPermissions(prev => prev.map(p => p.id === id ? { ...p, granted: !p.granted } : p));
  };

  const syncBluetoothDevices = async () => {
    const nav = navigator as any;
    if (!nav.bluetooth || !nav.bluetooth.getDevices) return;

    try {
      const authorizedDevices = await nav.bluetooth.getDevices();
      for (const device of authorizedDevices) {
        if (!devices.find(d => d.id === device.id)) {
          const newDevice: Device = {
            id: device.id,
            name: device.name || 'Appareil Autorisé',
            type: 'Bluetooth Device',
            signal: 'Connecté',
            icon: '📱',
            connected: true,
            difficulty: 'easy',
            stability: 'high'
          };
          setDevices(prev => [...prev, newDevice]);
          analyzeConnection(newDevice);
        }
      }
    } catch (error) {
      console.error('Bluetooth Sync Error:', error);
    }
  };

  const addDevice = (device: Device) => {
    analyzeConnection(device);
    setDevices(prev => {
      if (prev.find(d => d.id === device.id)) return prev;
      return [...prev, { ...device, connected: true }];
    });
    
    addAlert({
      title: 'Nouvel Appareil',
      desc: `${device.name} a été ajouté et synchronisé.`,
      type: 'green',
      icon: '✨',
      time: 'À l\'instant',
      actions: []
    });
  };

  const connectDevice = async (id: string) => {
    const device = devices.find(d => d.id === id);
    if (device) analyzeConnection(device);

    setDevices(prev => prev.map(d => d.id === id ? { ...d, connecting: true } : d));
    
    setTimeout(() => {
      setDevices(prev => prev.map(d => d.id === id ? { ...d, connected: true, connecting: false } : d));
      if (user) {
        calculateRealScores({ ...user });
      }
      
      addAlert({
        title: 'Appareil Connecté',
        desc: `${device?.name} est maintenant synchronisé en temps réel.`,
        type: 'green',
        icon: '✅',
        time: 'À l\'instant',
        actions: []
      });
    }, 1500);
  };

  const linkApp = async (id: string) => {
    const app = apps.find(a => a.id === id);
    if (app) analyzeConnection(app);

    try {
      let authUrl = '';
      if (id === 'google-fit' || id === 'calendar' || id === 'gmail') {
        const res = await fetch('/api/auth/google/url');
        const data = await res.json();
        authUrl = data.url;
      } else if (id === 'spotify') {
        const res = await fetch('/api/auth/spotify/url');
        const data = await res.json();
        authUrl = data.url;
      }

      if (authUrl) {
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        window.open(
          authUrl,
          'oauth_popup',
          `width=${width},height=${height},left=${left},top=${top}`
        );
        return;
      }

      // Fallback for other apps
      setApps(prev => prev.map(a => a.id === id ? { ...a, linking: true } : a));
      
      setTimeout(() => {
        setApps(prev => prev.map(a => a.id === id ? { ...a, linked: true, linking: false } : a));
        
        addAlert({
          title: 'Application Liée',
          desc: `${app?.name} partage désormais ses données avec 6S.`,
          type: 'green',
          icon: '🔗',
          time: 'À l\'instant',
          actions: []
        });
      }, 1200);
    } catch (error) {
      console.error('OAuth error:', error);
    }
  };

  // Listen for OAuth success
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) return;

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const provider = event.data.provider;
        if (provider === 'google') {
          setApps(prev => prev.map(app => 
            (app.id === 'google-fit' || app.id === 'calendar' || app.id === 'gmail') 
              ? { ...app, linked: true } 
              : app
          ));
        } else if (provider === 'spotify') {
          setApps(prev => prev.map(app => 
            app.id === 'spotify' ? { ...app, linked: true } : app
          ));
        }
        addAlert({
          title: 'Connexion Réussie',
          desc: `Votre compte ${provider.charAt(0).toUpperCase() + provider.slice(1)} est maintenant lié.`,
          type: 'green',
          icon: '✅',
          time: 'À l\'instant',
          actions: []
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <AppContext.Provider value={{ 
      user, setUser, scores, alerts, predictions, ghostTasks, devices, apps, permissions, 
      liveData, togglePermission, connectDevice, addDevice, linkApp, addContact, requestGhostTask, 
      removeAlert, 
      addAlert, 
      dismissPrediction, 
      syncBluetoothDevices,
      isLoading, 
      isGenerating 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
