import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Check, ChevronRight, Watch, X, Search, Bluetooth, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Connections: React.FC = () => {
  const { devices, apps, permissions, connectDevice, addDevice, linkApp, togglePermission, liveData, addAlert, syncBluetoothDevices } = useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any[]>([]);

  // Auto-sync on mount
  React.useEffect(() => {
    syncBluetoothDevices();
  }, []);

  const startScan = async () => {
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
      // Real Web Bluetooth Request with strict filters to avoid unknown devices
      const device = await nav.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { services: ['battery_service'] },
          { services: ['device_information'] },
          { services: ['fitness_machine'] },
          { services: ['cycling_power'] }
        ],
        optionalServices: ['battery_service', 'heart_rate', 'device_information']
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
    addDevice({
      id: res.id,
      name: res.name,
      type: res.type,
      signal: 'Fort',
      icon: res.icon || '📱'
    });
    setScanResults(prev => prev.filter(r => r.id !== res.id));
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">🔗 Apps & Appareils</h2>
        <button 
          onClick={syncBluetoothDevices}
          className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20"
        >
          <Zap size={12} /> Ghost Sync
        </button>
      </div>

      <section className="p-4 rounded-2xl bg-[#7c3aed]/5 border border-[#7c3aed]/20">
        <h3 className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-widest mb-2 flex items-center gap-2">
          🛡️ Protocole Ghost-Sync
        </h3>
        <p className="text-[10px] text-[#a0a0cc] leading-relaxed">
          Pour éviter les fenêtres de couplage répétitives et les connexions inconnues, l'IA privilégie les appareils déjà autorisés par votre système. Le scan manuel est filtré pour ne détecter que les objets connectés compatibles (Santé, Fitness, Smart Home).
        </p>
      </section>

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

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold text-[#6a6a99] uppercase tracking-widest">⌚ Objets Connectés</h3>
          <button 
            onClick={startScan}
            disabled={isScanning}
            className="text-[10px] font-bold text-[#7c3aed] flex items-center gap-1 disabled:opacity-50"
          >
            <Search size={10} /> {isScanning ? 'Recherche...' : 'Scanner'}
          </button>
        </div>

        {devices.length === 0 && !isScanning && scanResults.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-[#7c3aed]/10 to-transparent border border-[#7c3aed]/20 text-center space-y-4"
          >
            <div className="w-12 h-12 bg-[#7c3aed]/20 rounded-full flex items-center justify-center mx-auto">
              <Bluetooth className="text-[#7c3aed]" size={24} />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold">Bienvenue sur 6S Intuition</h4>
              <p className="text-[10px] text-[#a0a0cc] leading-relaxed">
                Aucun appareil n'est encore connecté. Pour commencer à recevoir vos données biométriques réelles :
              </p>
            </div>
            <div className="text-left space-y-2 bg-[#0a0a1a]/50 p-3 rounded-xl border border-white/5">
              <div className="flex gap-3 items-start">
                <span className="text-[10px] font-black text-[#7c3aed] bg-[#7c3aed]/10 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">1</span>
                <p className="text-[9px] text-[#a0a0cc]">Activez le Bluetooth sur votre appareil.</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-[10px] font-black text-[#7c3aed] bg-[#7c3aed]/10 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">2</span>
                <p className="text-[9px] text-[#a0a0cc]">Cliquez sur "Scanner" en haut à droite.</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-[10px] font-black text-[#7c3aed] bg-[#7c3aed]/10 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">3</span>
                <p className="text-[9px] text-[#a0a0cc]">Sélectionnez votre objet dans la liste système qui apparaîtra.</p>
              </div>
            </div>
          </motion.div>
        )}
        
        <AnimatePresence mode="popLayout">
          {isScanning && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-6 rounded-2xl bg-[#7c3aed]/5 border border-dashed border-[#7c3aed]/30 flex flex-col items-center justify-center gap-4 overflow-hidden"
            >
              <div className="relative">
                <div className="w-12 h-12 border-2 border-[#7c3aed]/30 rounded-full" />
                <div className="absolute inset-0 w-12 h-12 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Bluetooth className="w-5 h-5 text-[#7c3aed]" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-white font-bold mb-1">Recherche Ghost-Protocol...</p>
                <p className="text-[9px] text-[#a0a0cc]">Assurez-vous que vos appareils sont à proximité</p>
              </div>
            </motion.div>
          )}

          {scanResults.length > 0 && !isScanning && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-[#1a1a3e] border border-[#7c3aed]/50 space-y-3"
            >
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-[10px] font-black text-[#7c3aed] uppercase">Appareils trouvés</h4>
                <button onClick={() => setScanResults([])}><X size={12} className="text-[#6a6a99]" /></button>
              </div>
              {scanResults.map(res => (
                <div key={res.id} className="flex items-center justify-between p-2 bg-[#0a0a1a] rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Bluetooth size={14} className="text-blue-400" />
                    <div>
                      <div className="text-[11px] font-bold">{res.name}</div>
                      <div className="text-[9px] text-[#6a6a99]">{res.type} · {res.signal}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAppairage(res)}
                    className="px-3 py-1 bg-[#7c3aed] rounded-lg text-[9px] font-bold"
                  >
                    Appairer
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {devices.map(device => (
            <div 
              key={device.id} 
              className={`p-4 rounded-2xl bg-[#1a1a3e] border border-[#7c3aed]/20 flex items-center gap-4 transition-all ${device.connected ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
            >
              <div className="text-2xl w-10 text-center">{device.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold">{device.name}</h4>
                  {device.difficulty && (
                    <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                      device.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-500' : 
                      device.difficulty === 'moderate' ? 'bg-amber-500/10 text-amber-500' : 
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {device.difficulty}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#a0a0cc]">{device.type} · Signal {device.signal}</p>
              </div>
              {device.connected ? (
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <Check size={16} />
                </div>
              ) : device.connecting ? (
                <div className="flex items-center gap-2 text-[10px] text-[#7c3aed] font-bold">
                  <div className="w-4 h-4 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
                  Pairing...
                </div>
              ) : (
                <button 
                  onClick={() => connectDevice(device.id)}
                  className="px-3 py-1.5 bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] rounded-lg text-[10px] font-bold"
                >
                  Connecter
                </button>
              )}
            </div>
          ))}
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
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${perm.granted ? 'text-emerald-500' : 'text-[#6a6a99]'}`}>
                {perm.granted ? <Check size={18} /> : <ChevronRight size={18} />}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-4">
        <h3 className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
          ⚙️ Configuration Technique (OAuth)
        </h3>
        <p className="text-[10px] text-[#a0a0cc] leading-relaxed">
          Pour activer les connexions réelles, vous devez configurer vos identifiants dans les paramètres de l'application :
        </p>
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <h4 className="text-[9px] font-bold text-white mb-1">Google (Fit, Calendar, Gmail)</h4>
            <p className="text-[8px] text-[#a0a0cc] mb-2">URL de redirection : <code className="bg-black/50 px-1 rounded text-emerald-500">{window.location.origin}/api/auth/google/callback</code></p>
            <p className="text-[8px] text-[#a0a0cc]">Scopes requis : calendar.readonly, gmail.readonly, fitness.activity.read</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <h4 className="text-[9px] font-bold text-white mb-1">Spotify</h4>
            <p className="text-[8px] text-[#a0a0cc] mb-2">URL de redirection : <code className="bg-black/50 px-1 rounded text-emerald-500">{window.location.origin}/api/auth/spotify/callback</code></p>
            <p className="text-[8px] text-[#a0a0cc]">Scopes requis : user-read-recently-played, user-top-read</p>
          </div>
        </div>
      </section>
    </div>
  );
};
