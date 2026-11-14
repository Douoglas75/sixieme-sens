import { useState } from 'react';
import { Phone, MessageCircle, Check, Plus, Trash2 } from 'lucide-react';
import { useApp, daysSince, isoDay, Contact } from '../store';
import { Title, PANEL, Empty, Button } from '../ui';

const tone = (d: number) => (d <= 7 ? '#34d399' : d <= 14 ? '#fbbf24' : '#f87171');

function Radar({ list }: { list: Contact[] }) {
  const c = 150;
  return (
    <svg viewBox="0 0 300 300" className="mx-auto block w-full max-w-[300px]" role="img" aria-label="Radar des relations : plus un proche est près du centre, plus le contact est récent">
      {[50, 95, 140].map((r) => <circle key={r} cx={c} cy={c} r={r} fill="none" stroke="#262650" />)}
      <circle cx={c} cy={c} r="22" fill="#7c3aed" /><text x={c} y={c} textAnchor="middle" dominantBaseline="central" fontWeight="700">Moi</text>
      {list.map((p, i) => {
        const d = daysSince(p.lastContact), r = 50 + Math.min(d, 30) / 30 * 90, a = (Math.PI * 2 * i) / list.length - Math.PI / 2;
        const x = c + r * Math.cos(a), y = c + r * Math.sin(a);
        return <g key={p.id}><circle cx={x} cy={y} r="17" fill="#12122b" stroke={tone(d)} strokeWidth="2" /><text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="700" fill={tone(d)}>{p.name[0].toUpperCase()}</text></g>;
      })}
    </svg>
  );
}

export default function Social() {
  const { state, update } = useApp();
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ name: '', relation: 'Ami', phone: '' });
  const list = state.contacts;

  const add = () => {
    if (!f.name.trim()) return;
    update({ contacts: [...list, { id: crypto.randomUUID(), name: f.name.trim(), relation: f.relation, phone: f.phone.trim() || undefined, lastContact: isoDay() }] });
    setF({ name: '', relation: 'Ami', phone: '' }); setAdding(false);
  };
  const seen = (id: string) => update({ contacts: list.map((p) => (p.id === id ? { ...p, lastContact: isoDay() } : p)) });
  const remove = (id: string) => update({ contacts: list.filter((p) => p.id !== id) });
  const nudge = async (p: Contact) => {
    const text = `Salut ${p.name}, je pensais à toi. Comment vas-tu ?`;
    if (p.phone) location.href = `sms:${p.phone}?&body=${encodeURIComponent(text)}`;
    else if (navigator.share) navigator.share({ text }).catch(() => {});
    else navigator.clipboard?.writeText(text);
  };

  return (
    <>
      <Title sub="Ne laisse plus un proche sans nouvelles.">Relations</Title>
      {list.length === 0 ? (
        <Empty icon="👥" title="Ajoute tes proches" text="Famille, amis, collègues : le radar te montre qui tu n'as pas contacté depuis longtemps." action={<Button onClick={() => setAdding(true)}>Ajouter une personne</Button>} />
      ) : (
        <>
          <section className={`${PANEL} mx-5 p-3`}><Radar list={list} /></section>
          <ul className="mt-4 space-y-3">
            {list.map((p) => {
              const d = daysSince(p.lastContact);
              return (
                <li key={p.id} className={`${PANEL} mx-5 p-4`}>
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-full font-bold text-ink" style={{ background: tone(d) }}>{p.name[0].toUpperCase()}</div>
                    <div className="flex-1"><div className="font-semibold">{p.name}</div><div className="text-sm text-muted">{p.relation}, {d === 0 ? "contacté aujourd'hui" : `il y a ${d} j`}</div></div>
                    <button onClick={() => remove(p.id)} aria-label={`Supprimer ${p.name}`} className="text-muted"><Trash2 size={17} /></button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button onClick={() => nudge(p)}><MessageCircle className="mr-1 inline" size={14} />Écrire</Button>
                    {p.phone && <a href={`tel:${p.phone}`} className="rounded-xl border border-line bg-white/5 px-4 py-2.5 text-sm font-semibold"><Phone className="mr-1 inline" size={14} />Appeler</a>}
                    <Button kind="ghost" onClick={() => seen(p.id)}><Check className="mr-1 inline" size={14} />Contacté</Button>
                  </div>
                </li>
              );
            })}
          </ul>
          {!adding && <div className="mx-5 mt-4"><Button kind="ghost" onClick={() => setAdding(true)}><Plus className="mr-1 inline" size={14} />Ajouter une personne</Button></div>}
        </>
      )}
      {adding && (
        <div className={`${PANEL} mx-5 mt-4 space-y-3 p-4`}>
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Prénom" maxLength={30} aria-label="Prénom" className="w-full rounded-xl border border-line bg-ink px-4 py-3 outline-none focus:border-violet-500" />
          <select value={f.relation} onChange={(e) => setF({ ...f, relation: e.target.value })} aria-label="Relation" className="w-full rounded-xl border border-line bg-ink px-4 py-3">
            {['Famille', 'Ami', 'Collègue', 'Autre'].map((r) => <option key={r}>{r}</option>)}
          </select>
          <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="Téléphone (facultatif)" inputMode="tel" aria-label="Téléphone" className="w-full rounded-xl border border-line bg-ink px-4 py-3 outline-none focus:border-violet-500" />
          <div className="flex gap-2"><Button onClick={add} disabled={!f.name.trim()}>Ajouter</Button><Button kind="ghost" onClick={() => setAdding(false)}>Annuler</Button></div>
        </div>
      )}
    </>
  );
}
