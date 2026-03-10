import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ScoreData, Prediction, Alert, GhostTask, Device, AppConnection, Permission } from '../types';
import { useSecurity } from './SecurityContext';
import { PERMS_DATA, DEVICES_DATA, APPS_DATA } from '../constants';

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
  isLoading: boolean;
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

  const setUser = async (newUser: User) => {
    setUserState(newUser);
    if (!isLocked) {
      const encrypted = await encrypt(newUser);
      localStorage.setItem('6s_user_data', encrypted);
      
      // Save to backend as well for "production" feel
      try {
        await fetch('/api/user/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'default_user', data: encrypted })
        });
      } catch (e) {
        console.error('Failed to sync with backend', e);
      }
      
      // Recalculate scores based on new user data
      calculateRealScores(newUser);
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
      if (!isLocked) {
        // Try backend first, fallback to local
        let encryptedUser = null;
        try {
          const res = await fetch('/api/user/load/default_user');
          const { data } = await res.json();
          encryptedUser = data;
        } catch (e) {
          console.error('Failed to load from backend', e);
        }

        if (!encryptedUser) {
          encryptedUser = localStorage.getItem('6s_user_data');
        }

        if (encryptedUser) {
          try {
            const decrypted = await decrypt(encryptedUser);
            setUserState(decrypted);
            calculateRealScores(decrypted);
          } catch (e) {
            console.error('Failed to decrypt user data', e);
          }
        } else {
          // Default mock if nothing found
          generateMockData();
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isLocked]);

  const calculateRealScores = (userData: User) => {
    // Real logic based on user profile
    const healthBase = userData.sleep >= 7 ? 8.5 : 6.0;
    const activityBonus = userData.activity === 'athlete' ? 1.5 : userData.activity === 'high' ? 1.0 : 0.5;
    
    const financeBase = userData.finance === 'comfortable' ? 9.0 : userData.finance === 'ok' ? 7.0 : 5.0;
    
    const socialBase = userData.contacts.length > 10 ? 8.5 : userData.contacts.length > 5 ? 7.0 : 5.0;
    
    const cognitiveBase = 7.5; // Base cognitive performance
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

    // Dynamic alerts based on scores
    const newAlerts: Alert[] = [];
    if (parseFloat(mockScores.h) < 7) {
      newAlerts.push({ type: 'red', icon: 'HeartPulse', title: 'Déficit de récupération', desc: 'Votre sommeil est insuffisant pour votre niveau d\'activité.', time: 'Urgent', actions: ['Dormir +1h', 'Détails'] });
    }
    if (parseFloat(mockScores.f) < 6) {
      newAlerts.push({ type: 'yellow', icon: 'Wallet', title: 'Optimisation budgétaire', desc: 'Ghost-Admin a détecté 3 abonnements inutilisés.', time: 'Aujourd\'hui', actions: ['Résilier', 'Voir'] });
    }
    
    newAlerts.push({ type: 'green', icon: 'Zap', title: 'Pic de concentration', desc: 'Conditions idéales pour le travail profond.', time: '10:00 - 12:30', actions: ['Deep Focus', 'Ignorer'] });
    
    setAlerts(newAlerts);

    setPredictions([
      { id: '1', type: 'health', cat: 'Santé', title: 'Risque fatigue J+3', desc: 'Basé sur votre rythme actuel.', conf: 85, tl: 'J+3', rec: 'Repos forcé demain.', cd: [8, 7.5, 7, 6.2, 5.8, 6.5, 7.2, 8] },
      { id: '2', type: 'finance', cat: 'Finance', title: 'Économie possible 45€', desc: 'Analyse des frais bancaires.', conf: 92, tl: 'Ce mois', rec: 'Changer de forfait.', cd: [100, 95, 90, 85, 80, 75, 70, 65] }
    ]);

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
    try {
      await fetch('/api/tasks/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'default_user', taskType: taskName })
      });
      // Update UI to show task in progress
      setGhostTasks(prev => [
        { id: Date.now().toString(), icon: '🤖', bg: 'rgba(124,58,237,.15)', title: taskName, desc: 'L\'IA travaille pour vous...', st: 'progress', stl: '⏳ En cours' },
        ...prev.filter(t => t.st !== 'available')
      ]);
    } catch (e) {
      console.error('Failed to request task', e);
    }
  };

  const togglePermission = (id: string) => {
    setPermissions(prev => prev.map(p => p.id === id ? { ...p, granted: !p.granted } : p));
  };

  const connectDevice = (id: string) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, connected: true } : d));
  };

  const linkApp = (id: string) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, linked: true } : a));
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, scores, alerts, predictions, ghostTasks, devices, apps, permissions, 
      togglePermission, connectDevice, linkApp, addContact, requestGhostTask, isLoading 
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
