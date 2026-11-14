import { useState } from 'react';
import { Download, Trash2, Check } from 'lucide-react';
import { useApp, useApps, connectGoogle, demoState } from '../store';
import { Title, PANEL, Button } from '../ui';

export default function Settings() {
  const { state, update, reset } = useApp();
  const { apps, refresh } = useApps();
  const [name, setName] = useState(state.name);
  const [msg, setMsg] = useState('');

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sixieme-sens-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(a.href);
  };
  const google = async () => { const ok = await connectGoogle(); setMsg(ok ? 'Google est connecté.' : "La connexion n'a pas abouti."); refresh(); };
  const wipe = () => { if (confirm('Supprimer toutes tes données sur cet appareil ?')) reset(); };

  const soon = ['Google Maps et trafic', 'Banque (finance)', 'Objets connectés'];

  return (
    <>
      <Title>Réglages</Title>

      <section className={`${PANEL} mx-5 p-4`}>
        <label htmlFor="pname" className="text-sm font-semibold">Ton prénom</label>
        <div className="mt-2 flex gap-2">
          <input id="pname" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} className="min-w-0 flex-1 rounded-xl border border-line bg-ink px-4 py-2.5 outline-none focus:border-violet-500" />
          <Button onClick={() => name.trim() && update({ name: name.trim() })}>Enregistrer</Button>
        </div>
      </section>

      <h2 className="mt-6 px-5 text-lg font-bold">Connexions</h2>
      <div className={`${PANEL} mx-5 mt-2 divide-y divide-line`}>
        <div className="flex items-center gap-3 p-4">
          <div className="flex-1"><div className="font-semibold">Google</div><div className="text-xs text-muted">Agenda et activité Fit, lecture seule</div></div>
          {apps.google ? <span className="flex items-center gap-1 text-sm text-emerald-400"><Check size={16} />Connecté</span> : <Button onClick={google}>Connecter</Button>}
        </div>
        <div className="flex items-center gap-3 p-4">
          <div className="flex-1"><div className="font-semibold">Météo</div><div className="text-xs text-muted">Utilisée à ta demande depuis l'accueil</div></div>
          <span className={`text-sm ${apps.weather ? 'text-emerald-400' : 'text-muted'}`}>{apps.weather ? 'Prête' : 'Non configurée'}</span>
        </div>
        {soon.map((s) => (
          <div key={s} className="flex items-center gap-3 p-4"><div className="flex-1 font-semibold text-muted">{s}</div><span className="text-sm text-muted">Bientôt</span></div>
        ))}
      </div>
      {msg && <p role="status" className="mx-5 mt-2 text-sm text-muted">{msg}</p>}

      <h2 className="mt-6 px-5 text-lg font-bold">Données</h2>
      <div className="mx-5 mt-2 flex flex-wrap gap-2">
        <Button kind="ghost" onClick={exportData}><Download className="mr-1 inline" size={14} />Exporter mes données</Button>
        {state.mode === 'demo' && <Button kind="ghost" onClick={() => reset()}>Quitter la démo</Button>}
        <Button kind="danger" onClick={wipe}><Trash2 className="mr-1 inline" size={14} />Tout supprimer</Button>
      </div>
      <p className="mx-5 mt-4 text-xs text-muted">Tes check-ins et tes proches sont enregistrés sur cet appareil. Sixième Sens v0.1 (bêta).</p>
    </>
  );
}
