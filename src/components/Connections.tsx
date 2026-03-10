import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Check, ChevronRight, Watch } from 'lucide-react';

export const Connections: React.FC = () => {
  const { devices, apps, permissions, connectDevice, linkApp, togglePermission } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">🔗 Apps & Appareils</h2>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold text-[#6a6a99] uppercase tracking-widest">⌚ Objets Connectés</h3>
          <button className="text-[10px] font-bold text-[#7c3aed]">Scanner</button>
        </div>
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
