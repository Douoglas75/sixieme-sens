import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Check, ChevronRight, Watch, X, Search, Bluetooth, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Connections: React.FC = () => {
  const { devices, apps, permissions, connectDevice, addDevice, linkApp, togglePermission, liveData, addAlert, syncBluetoothDevices } = useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any[]>([]);
  const isAndroid = (window as any).AndroidBridge !== undefined;

  // Auto-sync on mount
  React.useEffect(() => {
    syncBluetoothDevices();

    // Listen for Android Bridge events
    if (isAndroid) {
      const handleDeviceFound = (e: any) => {
        const device = e.detail;
        setScanResults(prev => {
          if (prev.find(d => d.id === device.id)) return prev;
          return [...prev, {
            id: device.id,
            name: device.name,
            type: 'Bluetooth Device',
            signal: `${device.rssi} dBm`,
            icon: '📱',
            difficulty: 'easy',
            stability: 'high'
          }];
        });
      };

      const handleScanFinished = () => setIsScanning(false);

      const handleScanError = (e: any) => {
        setIsScanning(false);
        const errorMsg = e.detail?.error || "Bluetooth non disponible ou désactivé";
        addAlert({
          title: 'Erreur Bluetooth Android',
          desc: `${errorMsg}. Veuillez vérifier que le Bluetooth est activé et que l'application a l'autorisation de localisation.`,
          type: 'red',
          icon: '❌',
          time: 'À l\'instant',
          actions: []
        });
      };

      const handleConnectionChange = (e: any) => {
        const { address, status } = e.detail;
        if (status === 'connected') {
          // Device connected, update state if needed
        }
      };

      window.addEventListener('onDeviceFound' as any, handleDeviceFound);
      window.addEventListener('onScanFinished' as any, handleScanFinished);
      window.addEventListener('onScanError' as any, handleScanError);
      window.addEventListener('onConnectionStateChange' as any, handleConnectionChange);

      return () => {
        window.removeEventListener('onDeviceFound' as any, handleDeviceFound);
        window.removeEventListener('onScanFinished' as any, handleScanFinished);
        window.removeEventListener('onScanError' as any, handleScanError);
        window.removeEventListener('onConnectionStateChange' as any, handleConnectionChange);
      };
    }
  }, [isAndroid]);

  // Automatic Android permission check and redirection
  React.useEffect(() => {
    if (isAndroid) {
      const hasLocation = permissions.find(p => p.id === 'location')?.granted;
      if (hasLocation === false) {
        addAlert({
          title: '📍 Permission requise',
          desc: 'Redirection automatique vers vos paramètres pour activer la localisation GPS, nécessaire pour trouver les appareils Bluetooth.',
          type: 'yellow',
          icon: '📍',
          time: 'À l\'instant',
          actions: []
        });

        const timer = setTimeout(() => {
          if ((window as any).AndroidBridge?.openAppSettings) {
            (window as any).AndroidBridge.openAppSettings();
          }
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [isAndroid, permissions]);

  const startScan = async () => {
    if (isAndroid) {
      setIsScanning(true);
      setScanResults([]);
      try {
        const bridge = (window as any).AndroidBridge;
        if (bridge?.startBluetoothScan) {
          bridge.startBluetoothScan();
        } else if (bridge?.startScan) {
          bridge.startScan();
        } else {
          setIsScanning(false);
          addAlert({
            title: 'Pont Android Non Prêt',
            desc: "L'interface de communication Bluetooth native n'est pas encore initialisée.",
            type: 'red',
            icon: '⚠️',
            time: 'À l\'instant',
            actions: []
          });
        }
      } catch (err) {
        setIsScanning(false);
        console.error("Android startScan error:", err);
      }
      return;
    }

    const nav = navigator as any;
    if (!nav.bluetooth) {
      addAlert({
        title: 'Bluetooth Non Supporté',
        desc: 'Votre navigateur ne supporte pas le Web Bluetooth. Utilisez Chrome ou Edge.',
        type: 'red',
        icon: '⚠️',
        time: 'À l\'instant',
        actions: []
      });
      return;
    }

    setIsScanning(true);
    setScanResults([]);
    
    try {
      // Broaden Bluetooth filters to detect more devices
      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'heart_rate', 'device_information', 'fitness_machine', 'cycling_power', 'cycling_speed_and_cadence']
      });

      if (device) {
        const newDevice = {
          id: device.id,
          name: device.name || 'Appareil Inconnu',
          type: 'Bluetooth Device',
          signal: 'Détecté',
          icon: '📱',
          difficulty: 'easy',
          stability: 'high'
        };
        
        setScanResults([newDevice]);
      }
    } catch (error) {
      console.error('Bluetooth Scan Error:', error);
      const err = error as any;
      
      if (err.name !== 'NotFoundError') {
        let errorMessage = 'Impossible d\'accéder au Bluetooth.';
        if (err.name === 'SecurityError' || err.message.includes('permissions policy')) {
          errorMessage = 'Accès Bluetooth bloqué par la politique de sécurité. Essayez d\'ouvrir l\'application dans un nouvel onglet.';
        }

        addAlert({
          title: 'Erreur Scan',
          desc: errorMessage,
          type: 'red',
          icon: '❌',
          time: 'À l\'instant',
          actions: [
            { label: 'Ouvrir dans un nouvel onglet', onClick: () => window.open(window.location.href, '_blank') }
          ]
        });
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleAppairage = (res: any) => {
    if (isAndroid) {
      (window as any).AndroidBridge.connectToDevice(res.id);
    }
    
    addDevice({
      id: res.id,
      name: res.name,
      type: res.type,
      signal: res.signal || 'Fort',
      icon: res.icon || '📱'
    });
    setScanResults(prev => prev.filter(r => r.id !== res.id));
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">🔗 Apps & Appareils</h2>
      </div>

      {/* Live Data Stream */}
      {liveData.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-[#6a6a99] uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Flux de données temps réel
            </h3>
          </div>
          <div className="bg-[#1a1a3e] border border-white/5 rounded-2xl p-4 overflow-hidden">
            <div className="space-y-2">
              {liveData.slice(0, 3).map((data, i) => (
                <motion.div 
                  key={`${data.timestamp}-${i}`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center justify-between text-[10px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[#7c3aed] font-mono">[{data.source}]</span>
                    <span className="text-white/70">{data.type === 'heart_rate' ? 'Rythme cardiaque' : data.type === 'steps' ? 'Pas détectés' : 'Transaction'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">
                      {typeof data.value === 'object' ? `${data.value.amount}€` : data.value}
                      {data.type === 'heart_rate' ? ' bpm' : ''}
                    </span>
                    <span className="text-white/20 text-[8px]">{new Date(data.timestamp).toLocaleTimeString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Solution de Synchronisation Hybride (APK / WebView) */}
      <section className="p-5 rounded-3xl bg-gradient-to-br from-[#1e1b4b] to-[#0a051d] border border-blue-500/30 space-y-3">
        <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
          📲 Guide de Connexion Mobile (APK)
        </h3>
        <p className="text-[10.5px] text-[#a0a0cc] leading-relaxed">
          Google bloque l'authentification directe (erreur <code className="text-[#ec4899] font-mono bg-black/40 px-1 rounded text-[9.5px]">disallowed_useragent</code>) au sein des applications Android APK non vérifiées.
        </p>
        <div className="space-y-3 bg-[#0a0a1a]/70 p-4 rounded-2xl border border-white/5 text-[9.5px] text-[#a0a0cc]">
          <p className="font-bold text-white text-[10px]">Pour lier vos comptes Google Fit & Google Agenda :</p>
          <div className="flex gap-2 items-start">
            <span className="text-[#a0a0cc] font-black">1.</span>
            <p>Ouvrez l'application directement dans le navigateur Chrome sécurisé de votre mobile :</p>
          </div>
          
          <div className="flex flex-col gap-2 mt-1 mb-2">
            <button 
              onClick={(e) => {
                e.preventDefault();
                const bypassUrl = `${window.location.origin}/?source=apk&bypass=true`;
                const bridge = (window as any).AndroidBridge;
                if (bridge && typeof bridge.openExternalBrowser === 'function') {
                  bridge.openExternalBrowser(bypassUrl);
                } else {
                  window.open(bypassUrl, '_blank');
                }
              }}
              className="w-full text-center px-4 py-3 bg-gradient-to-r from-blue-500 via-indigo-600 to-violet-600 hover:from-blue-600 hover:via-indigo-700 hover:to-violet-700 active:scale-95 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 border border-white/10"
            >
              🌐 Ouvrir 6S dans Chrome mobile (Pour lier les comptes)
            </button>
            <div className="bg-black/60 p-2.5 rounded-xl text-[8.5px] font-mono text-blue-300 flex items-center justify-between gap-2 overflow-hidden border border-blue-500/10">
              <span className="truncate mr-2">{window.location.origin}/?source=apk&bypass=true</span>
              <button 
                onClick={() => {
                  const bypassUrl = `${window.location.origin}/?source=apk&bypass=true`;
                  navigator.clipboard.writeText(bypassUrl);
                  addAlert({
                    title: 'Lien copié !',
                    desc: 'Collez ce lien dans Chrome pour finaliser la synchronisation sans repasser par l\'inscription.',
                    type: 'green',
                    icon: '📋',
                    time: 'À l\'instant',
                    actions: []
                  });
                }}
                className="px-2 py-1 bg-[#7c3aed]/20 hover:bg-[#7c3aed]/40 text-white rounded text-[8px] font-bold shrink-0 transition-all hover:scale-105 active:scale-95"
              >
                Copier
              </button>
            </div>
          </div>

          <div className="flex gap-2 items-start mt-2">
            <span className="text-[#a0a0cc] font-black">2.</span>
            <p className="leading-snug">Cliquez sur <span className="text-white font-bold">"Lier"</span> pour Google directement dans Chrome.</p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-[#a0a0cc] font-black">3.</span>
            <p className="leading-snug">De retour dans votre APK, vos données (pas, sommeil, agenda) se synchroniseront de manière transparente !</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold text-[#6a6a99] uppercase tracking-widest">📱 Applications</h3>
        </div>
        <div className="space-y-2">
          {apps.map(app => (
            <div 
              key={app.id} 
              className={`p-4 rounded-2xl bg-[#1a1a3e] border border-[#7c3aed]/20 flex items-center gap-4 transition-all ${app.linked ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: app.bg }}>
                {app.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold">{app.name}</h4>
                  {app.difficulty && (
                    <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                      app.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-500' : 
                      app.difficulty === 'moderate' ? 'bg-amber-500/10 text-amber-500' : 
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {app.difficulty}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#a0a0cc]">{app.desc}</p>
              </div>
              {app.linked ? (
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <Check size={16} />
                </div>
              ) : app.linking ? (
                <div className="flex items-center gap-2 text-[10px] text-[#7c3aed] font-bold">
                  <div className="w-4 h-4 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
                  Auth...
                </div>
              ) : (
                <button 
                  onClick={() => linkApp(app.id)}
                  className="px-3 py-1.5 bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] rounded-lg text-[10px] font-bold"
                >
                  Lier
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="p-4 rounded-2xl bg-[#7c3aed]/5 border border-[#7c3aed]/20">
        <h3 className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-widest mb-3 flex items-center gap-2">
          <Shield size={12} /> Rapport de Compatibilité
        </h3>
        <p className="text-[10px] text-[#a0a0cc] leading-relaxed">
          L'IA 6S surveille en permanence les changements d'API des services tiers. Les connexions marquées <span className="text-emerald-500 font-bold">EASY</span> utilisent des protocoles standardisés (OAuth2, HealthKit) garantissant une stabilité à long terme. Les connexions <span className="text-red-500 font-bold">HARD</span> dépendent de méthodes propriétaires susceptibles de changer.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold text-[#6a6a99] uppercase tracking-widest">🔐 Autorisations</h3>
        </div>
        <div className="space-y-2">
          {permissions.map(perm => (
            <div 
              key={perm.id} 
              onClick={() => togglePermission(perm.id)}
              className={`p-4 rounded-2xl bg-[#1a1a3e] border border-[#7c3aed]/20 flex items-center gap-4 cursor-pointer transition-all ${perm.granted ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: perm.bg }}>
                {perm.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold">{perm.name}</h4>
                <p className="text-[10px] text-[#a0a0cc]">{perm.desc}</p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${perm.granted ? 'text-emerald-500 bg-emerald-500/10' : 'text-[#6a6a99] bg-white/5'}`}>
                {perm.granted ? <Check size={20} /> : <ChevronRight size={20} />}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-4">
        <h3 className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
          ⚙️ Configuration Technique (OAuth & API)
        </h3>
        <p className="text-[10px] text-[#a0a0cc] leading-relaxed">
          Pour activer les connexions réelles, configurez vos identifiants dans les paramètres (Secrets) :
        </p>
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <h4 className="text-[9px] font-bold text-white mb-1">Google (Fit, Calendar, Gmail)</h4>
            <p className="text-[8px] text-[#a0a0cc] mb-2">URL de redirection : <code className="bg-black/50 px-1 rounded text-emerald-500">{window.location.origin}/api/auth/google/callback</code></p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <h4 className="text-[9px] font-bold text-white mb-1">OpenWeatherMap</h4>
            <p className="text-[8px] text-[#a0a0cc]">Clé requise : <code className="bg-black/50 px-1 rounded text-emerald-500">OPENWEATHER_API_KEY</code></p>
          </div>
        </div>
      </section>
    </div>
  );
};
