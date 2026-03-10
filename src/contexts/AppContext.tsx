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
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!isLocked) {
        const encryptedUser = localStorage.getItem('6s_user_data');
        if (encryptedUser) {
          try {
            const decrypted = await decrypt(encryptedUser);
            setUserState(decrypted);
          } catch (e) {
            console.error('Failed to decrypt user data', e);
          }
        }
        
        // Generate mock data if not exists
        generateMockData();
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isLocked]);

  const generateMockData = () => {
    // Mock score generation
    const mockScores: ScoreData = {
      h: (7 + Math.random() * 2).toFixed(1),
      f: (6 + Math.random() * 2.5).toFixed(1),
      s: (5.5 + Math.random() * 3).toFixed(1),
      c: (7 + Math.random() * 2.5).toFixed(1),
      k: (6 + Math.random() * 3).toFixed(1),
      a: (7.5 + Math.random() * 2.5).toFixed(1),
      t: '7.8'
    };
    setScores(mockScores);

    setAlerts([
      { type: 'red', icon: 'HeartPulse', title: 'Risque fatigue accumulée', desc: 'Sommeil irrégulier + activité → déficit détecté.', time: 'Prédiction J+5', actions: ['Ajuster sommeil', 'Rappel'] },
      { type: 'yellow', icon: 'Wallet', title: 'Dépense inhabituelle prévue', desc: 'Dépenses +30% cette période historiquement.', time: 'Prédiction J+14', actions: ['Détails', 'Ignorer'] },
      { type: 'green', icon: 'Zap', title: 'Pic énergie : 10h-12h', desc: 'Pic de performance cognitive détecté.', time: 'Aujourd\'hui', actions: ['Deep Focus', 'Noté'] }
    ]);

    setPredictions([
      { id: '1', type: 'health', cat: 'Santé', title: 'Risque rhume J+10-14', desc: 'Basé sur sommeil, saison, données épidémiologiques.', conf: 72, tl: 'J+10 à J+14', rec: 'Vitamine C, sommeil 8h.', cd: [30, 45, 55, 62, 72, 78, 72, 65] },
      { id: '2', type: 'finance', cat: 'Finance', title: 'Fin de mois serrée', desc: 'Patterns de dépenses → solde bas. Réduction 12% recommandée.', conf: 81, tl: 'J+18 à J+25', rec: 'Reporter achats non essentiels.', cd: [80, 75, 68, 60, 52, 45, 38, 35] }
    ]);

    setGhostTasks([
      { id: '1', icon: '📊', bg: 'rgba(59,130,246,.15)', title: 'Comparaison assurance', desc: '12 offres analysées. 3 alternatives, économie 22-34€/mois.', st: 'completed', stl: '✅ Terminée', sav: '→ Économie : 34€/mois' },
      { id: '2', icon: '📅', bg: 'rgba(16,185,129,.15)', title: 'Disponible', desc: 'Sélectionnez une tâche à automatiser.', st: 'available', stl: '🟢 Dispo' }
    ]);
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
      togglePermission, connectDevice, linkApp, isLoading 
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
