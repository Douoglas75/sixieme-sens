import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Check, ChevronRight, Watch, X, Search, Bluetooth } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Connections: React.FC = () => {
  const { devices, apps, permissions, connectDevice, linkApp, togglePermission } = useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any[]>([]);

  const startScan = async () => {
    setIsScanning(true);
    setScanResults([]);
    
    // Try real Bluetooth if available
    if ('bluetooth' in navigator) {
      try {
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true
        });
        if (device) {
          setScanResults([{ id: device.id, name: device.name || 'Appareil Inconnu', type: 'Bluetooth', signal: 'Fort' }]);
          setIsScanning(false);
          return;
        }
      } catch (e) {
        console.warn("Real Bluetooth scan failed or cancelled. Falling back to simulation.", e);
      }
    }

    // Fallback simulation
    setTimeout(() => {
      setScanResults([
        { id: 'scan-1', name: 'Oura Ring Gen 4', type: 'Santé', signal: '-42dBm' },
        { id: 'scan-2', name: 'Sony WH-1000XM6', type: 'Audio', signal: '-58dBm' }
      ]);
      setIsScanning(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">🔗 Apps & Appareils</h2>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold text-[#6a6a99] uppercase tracking-widest">⌚ Objets Connectés</h3>
          <button 
            onClick={startScan}
            className="text-[10px] font-bold text-[#7c3aed] flex items-center gap-1"
          >
            <Search size={10} /> Scanner
          </button>
        </div>
        
        <AnimatePresence>
          {isScanning && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-2xl bg-[#7c3aed]/5 border border-dashed border-[#7c3aed]/30 flex flex-col items-center justify-center gap-3 overflow-hidden"
            >
              <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] text-[#a0a0cc] font-bold animate-pulse">Recherche d'appareils Bluetooth...</p>
            </motion.div>
          )}

          {scanResults.length > 0 && !isScanning && (
            <motion.div 
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
                    onClick={() => {
                      alert(`Appairage avec ${res.name}...`);
                      setScanResults([]);
                    }}
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
                <h4 className="text-sm font-bold">{device.name}</h4>
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
                <h4 className="text-sm font-bold">{app.name}</h4>
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
    </div>
  );
};
