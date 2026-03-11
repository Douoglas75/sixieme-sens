import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ScoreData, Prediction, Alert, GhostTask, Device, AppConnection, Permission } from '../types';
import { useSecurity } from './SecurityContext';
import { PERMS_DATA, DEVICES_DATA, APPS_DATA } from '../constants';

import { generatePersonalizedInsights } from '../services/geminiService';

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
  togglePermission: (id: string) => void;
  connectDevice: (id: string) => void;
  linkApp: (id: string) => void;
  addContact: (contact: any) => void;
  requestGhostTask: (taskName: string) => Promise<void>;
  removeAlert: (id: string) => void;
  dismissPrediction: (id: string) => void;
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
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const removeAlert = (title: string) => {
    setAlerts(prev => prev.filter(a => a.title !== title));
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
      // Simulate background intelligence logic
      const randomChance = Math.random();
      if (randomChance > 0.95) {
        const newAlert: Alert = {
          title: 'Optimisation Détectée',
          desc: 'L\'IA a identifié une opportunité d\'économie sur vos abonnements.',
          type: 'green',
          icon: '💰',
          time: 'À l\'instant',
          actions: ['Voir détails']
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
      }
      
      // Subtle score fluctuations to show "live" data
      setScores(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          h: (parseFloat(prev.h) + (Math.random() * 0.1 - 0.05)).toFixed(1),
          f: (parseFloat(prev.f) + (Math.random() * 0.1 - 0.05)).toFixed(1),
          t: (parseFloat(prev.t) + (Math.random() * 0.02 - 0.01)).toFixed(1)
        };
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(intelligenceInterval);
  }, [user, isLocked]);

  const calculateRealScores = (userData: User) => {
    const healthBase = userData.sleep >= 7 ? 8.5 : 6.0;
    const activityBonus = userData.activity === 'athlete' ? 1.5 : userData.activity === 'high' ? 1.0 : 0.5;
    const financeBase = userData.finance === 'comfortable' ? 9.0 : userData.finance === 'ok' ? 7.0 : 5.0;
    const socialBase = userData.contacts.length > 10 ? 8.5 : userData.contacts.length > 5 ? 7.0 : 5.0;
    
    const cognitiveBase = 7.5;
    const careerBase = 7.0;
    const adminBase = 8.0;

    const mockScores: ScoreData = {
      h: (healthBase + activityBonus + (Math.random() * 0.5)).toFixed(1),
      f: (financeBase + (Math.random() * 0.8)).toFixed(1),
      s: (socialBase + (Math.random() * 0.5)).toFixed(1),
      c: (cognitiveBase + (Math.random() * 0.5)).toFixed(1),
      k: (careerBase + (Math.random() * 0.5)).toFixed(1),
      a: (adminBase + (Math.random() * 0.5)).toFixed(1),
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

  const connectDevice = async (id: string) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, connecting: true } : d));
    
    // Try real Bluetooth if available
    if ('bluetooth' in navigator) {
      try {
        // This will prompt the user for a real device
        // Note: In an iframe this might fail, so we have a fallback
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true
        });
        console.log("Connected to real device:", device.name);
      } catch (e) {
        console.warn("Real Bluetooth request failed or cancelled. Using simulation.", e);
      }
    }

    setTimeout(() => {
      setDevices(prev => prev.map(d => d.id === id ? { ...d, connected: true, connecting: false } : d));
      const device = devices.find(d => d.id === id);
      if (device?.type.includes('Santé') && user) {
        calculateRealScores({ ...user });
      }
    }, 2000);
  };

  const linkApp = (id: string) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, linking: true } : a));
    setTimeout(() => {
      setApps(prev => prev.map(a => a.id === id ? { ...a, linked: true, linking: false } : a));
    }, 1500);
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, scores, alerts, predictions, ghostTasks, devices, apps, permissions, 
      togglePermission, connectDevice, linkApp, addContact, requestGhostTask, 
      removeAlert, dismissPrediction, isLoading, isGenerating 
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
