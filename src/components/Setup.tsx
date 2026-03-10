import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { User, Contact } from '../types';
import { User as UserIcon, Bed, Activity, Euro, Users, Eye } from 'lucide-react';

export const Setup: React.FC = () => {
  const { setUser } = useApp();
  const [name, setName] = useState('');
  const [sleep, setSleep] = useState(7);
  const [activity, setActivity] = useState<'low' | 'medium' | 'high' | 'athlete'>('medium');
  const [finance, setFinance] = useState<'tight' | 'ok' | 'comfortable'>('ok');
  const [contacts, setContacts] = useState<Contact[]>([
    { name: '', relation: '', lastContact: 1 },
    { name: '', relation: '', lastContact: 1 },
    { name: '', relation: '', lastContact: 1 },
    { name: '', relation: '', lastContact: 1 },
    { name: '', relation: '', lastContact: 1 }
  ]);

  const handleContactChange = (index: number, field: keyof Contact, value: string | number) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setContacts(newContacts);
  };

  const handleSubmit = () => {
    const filteredContacts = contacts.filter(c => c.name.trim() !== '');
    const finalUser: User = {
      name: name || 'Utilisateur',
      sleep,
      activity,
      finance,
      contacts: filteredContacts.length > 0 ? filteredContacts : [
        { name: 'Maman', relation: 'Famille', lastContact: 5 },
        { name: 'Thomas', relation: 'Ami', lastContact: 12 }
      ]
    };
    setUser(finalUser);
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a1a] overflow-y-auto p-6 pb-12">
      <div className="text-center mb-8 pt-8">
        <h2 className="text-2xl font-bold mb-2">👋 Configurons votre 6S</h2>
        <p className="text-[#a0a0cc] text-sm">Ces informations restent sur votre appareil</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#a0a0cc]">
            <UserIcon size={16} /> Votre prénom
          </label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Sarah"
            className="w-full p-4 bg-[#1a1a3e] border border-[#7c3aed]/20 rounded-xl outline-none focus:border-[#7c3aed]"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#a0a0cc]">
            <Bed size={16} /> Heures de sommeil
          </label>
          <select 
            value={sleep}
            onChange={e => setSleep(Number(e.target.value))}
            className="w-full p-4 bg-[#1a1a3e] border border-[#7c3aed]/20 rounded-xl outline-none focus:border-[#7c3aed]"
          >
            <option value={5}>Moins de 5h</option>
            <option value={6}>5-6h</option>
            <option value={7}>6-7h</option>
            <option value={8}>7-8h</option>
            <option value={9}>Plus de 8h</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#a0a0cc]">
            <Activity size={16} /> Activité
          </label>
          <select 
            value={activity}
            onChange={e => setActivity(e.target.value as any)}
            className="w-full p-4 bg-[#1a1a3e] border border-[#7c3aed]/20 rounded-xl outline-none focus:border-[#7c3aed]"
          >
            <option value="low">Sédentaire</option>
            <option value="medium">Modéré</option>
            <option value="high">Actif</option>
            <option value="athlete">Sportif</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#a0a0cc]">
            <Euro size={16} /> Situation financière
          </label>
          <select 
            value={finance}
            onChange={e => setFinance(e.target.value as any)}
            className="w-full p-4 bg-[#1a1a3e] border border-[#7c3aed]/20 rounded-xl outline-none focus:border-[#7c3aed]"
          >
            <option value="tight">Serrée</option>
            <option value="ok">Correcte</option>
            <option value="comfortable">Confortable</option>
          </select>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#a0a0cc]">
            <Users size={16} /> Vos 5 contacts clés
          </label>
          {contacts.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input 
                type="text" 
                value={c.name}
                onChange={e => handleContactChange(i, 'name', e.target.value)}
                placeholder={`Contact ${i+1}`}
                className="flex-1 p-3 bg-[#1a1a3e] border border-[#7c3aed]/20 rounded-xl text-sm outline-none"
              />
              <input 
                type="text" 
                value={c.relation}
                onChange={e => handleContactChange(i, 'relation', e.target.value)}
                placeholder="Relation"
                className="w-24 p-3 bg-[#1a1a3e] border border-[#7c3aed]/20 rounded-xl text-sm outline-none"
              />
            </div>
          ))}
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full py-5 bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] rounded-xl font-bold text-lg shadow-lg shadow-[#7c3aed]/40 mt-8"
        >
          <Eye size={20} className="inline mr-2" /> Lancer Sixième Sens
        </button>
      </div>
    </div>
  );
};
