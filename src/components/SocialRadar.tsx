import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, MessageSquare, UserPlus, X, Check } from 'lucide-react';

export const SocialRadar: React.FC = () => {
  const { user, addContact } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', relation: 'Ami' });

  if (!user) return null;

  const contacts = user.contacts.map(c => ({
    ...c,
    health: c.lastContact <= 7 ? 'healthy' : c.lastContact <= 21 ? 'warning' : 'danger'
  }));

  const pos = [
    { t: '5%', l: '45%' },
    { t: '30%', l: '85%' },
    { t: '70%', l: '80%' },
    { t: '75%', l: '10%' },
    { t: '25%', l: '5%' }
  ];

  const bgColors = [
    'bg-emerald-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-cyan-500',
    'bg-pink-500'
  ];

  const handleAdd = () => {
    if (newContact.name) {
      addContact({
        ...newContact,
        lastContact: 0,
        health: 'healthy'
      });
      setShowAddModal(false);
      setNewContact({ name: '', relation: 'Ami' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">👥 Radar Social</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-10 h-10 rounded-full bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed]"
        >
          <UserPlus size={20} />
        </button>
      </div>
      
      <div className="relative w-64 h-64 mx-auto mb-8">
        {[1, 2, 3].map(i => (
          <div 
            key={i} 
            className="absolute inset-0 border border-[#7c3aed]/15 rounded-full" 
            style={{ 
              width: `${100 - (i-1)*30}%`, 
              height: `${100 - (i-1)*30}%`,
              top: `${(i-1)*15}%`,
              left: `${(i-1)*15}%`
            }} 
          />
        ))}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center text-sm font-black shadow-lg shadow-[#7c3aed]/50 z-10">
          {user.name.charAt(0)}
        </div>
        
        {contacts.map((c, i) => (
          <motion.div 
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all z-10 ${
              c.health === 'healthy' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 
              c.health === 'warning' ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 
              'bg-red-500/20 border-red-500 text-red-500 animate-pulse'
            }`}
            style={{ top: pos[i % pos.length].t, left: pos[i % pos.length].l }}
          >
            {c.name.charAt(0)}
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold">📋 Relations</h2>
        <span className="text-xs text-[#6a6a99]">{contacts.length} contacts</span>
      </div>

      <div className="space-y-3">
        {contacts.map((c, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-2xl bg-[#1a1a3e] border border-[#7c3aed]/20 flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${bgColors[i % bgColors.length]}`}>
              {c.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold">{c.name}</h3>
              <p className="text-[10px] text-[#a0a0cc]">{c.relation} · Il y a {c.lastContact}j</p>
              {c.health !== 'healthy' && (
                <div className="flex gap-2 mt-2">
                  <button className="px-3 py-1.5 bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] rounded-lg text-[10px] font-bold flex items-center gap-1">
                    <Phone size={10} /> Appeler
                  </button>
                  <button className="px-3 py-1.5 bg-[#0a0a1a] rounded-lg text-[10px] font-bold flex items-center gap-1 text-[#a0a0cc]">
                    <MessageSquare size={10} /> Message
                  </button>
                </div>
              )}
            </div>
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
              c.health === 'healthy' ? 'bg-emerald-500/10 text-emerald-500' : 
              c.health === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
            }`}>
              {c.health === 'healthy' ? '✅ Bon' : c.health === 'warning' ? '⚠️ Surveiller' : '🔴 Alerte'}
            </span>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#1a1a3e] border border-[#7c3aed]/30 rounded-[2rem] p-8 shadow-2xl"
            >
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-6 right-6 text-[#a0a0cc]"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-xl font-bold mb-6">Ajouter un contact</h3>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-[10px] text-[#6a6a99] uppercase font-bold mb-1.5 block">Nom complet</label>
                  <input 
                    value={newContact.name}
                    onChange={e => setNewContact({...newContact, name: e.target.value})}
                    className="w-full bg-[#0a0a1a] border border-[#7c3aed]/20 rounded-xl p-3 text-sm outline-none focus:border-[#7c3aed]"
                    placeholder="Ex: Jean Dupont"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6a6a99] uppercase font-bold mb-1.5 block">Relation</label>
                  <select 
                    value={newContact.relation}
                    onChange={e => setNewContact({...newContact, relation: e.target.value})}
                    className="w-full bg-[#0a0a1a] border border-[#7c3aed]/20 rounded-xl p-3 text-sm outline-none focus:border-[#7c3aed]"
                  >
                    <option>Ami</option>
                    <option>Famille</option>
                    <option>Collègue</option>
                    <option>Partenaire</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleAdd}
                className="w-full py-4 bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <Check size={18} /> Confirmer l'ajout
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
