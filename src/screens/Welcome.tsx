import { useState } from 'react';
import { Sparkles, Smartphone, Globe } from 'lucide-react';
import { useApp, demoState, connectGoogle } from '../store';
import { PANEL } from '../ui';

export default function Welcome() {
  const { update } = useApp();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const ready = name.trim().length > 0;

  const start = (mode: 'local' | 'google') => update({ onboarded: true, mode, name: name.trim() });
  const google = async () => {
    setBusy(true); setErr('');
    const ok = await connectGoogle();
    setBusy(false);
    ok ? start('google') : setErr("La connexion Google n'a pas abouti. Réessaie, ou commence sans compte.");
  };

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-5 py-10" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}>
      <img src="/icon-512.png" alt="Logo Sixième Sens" className="mx-auto h-28 w-28 rounded-3xl shadow-[0_0_60px_rgba(124,58,237,.45)]" />
      <h1 className="mt-6 text-center text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
        Sixième Sens
      </h1>
      <p className="mx-auto mt-3 max-w-xs text-center text-muted">
        Six domaines de ta vie suivis ensemble : santé, finance, social, cognitif, carrière et administratif.
      </p>

      <label className="mt-8 block text-sm font-semibold" htmlFor="name">Comment t'appelles-tu ?</label>
      <input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder="Ton prénom"
        className="mt-2 w-full rounded-xl border border-line bg-panel px-4 py-3 outline-none focus:border-violet-500" />

      <div className="mt-5 space-y-3">
        <button disabled={!ready} onClick={() => start('local')} className={`${PANEL} flex w-full items-center gap-4 p-4 text-left disabled:opacity-40`}>
          <Smartphone className="text-violet-400" />
          <span><span className="block font-semibold">Commencer sur cet appareil</span><span className="text-sm text-muted">Sans compte. Tes données restent sur ce téléphone.</span></span>
        </button>
        <button disabled={!ready || busy} onClick={google} className={`${PANEL} flex w-full items-center gap-4 p-4 text-left disabled:opacity-40`}>
          <Globe className="text-blue-400" />
          <span><span className="block font-semibold">{busy ? 'Connexion en cours…' : 'Se connecter avec Google'}</span><span className="text-sm text-muted">Agenda et activité Fit, en lecture seule.</span></span>
        </button>
        <button onClick={() => update(demoState())} className={`${PANEL} flex w-full items-center gap-4 p-4 text-left`}>
          <Sparkles className="text-amber-300" />
          <span><span className="block font-semibold">Voir la démo</span><span className="text-sm text-muted">Explore avec des données fictives.</span></span>
        </button>
      </div>
      {err && <p role="alert" className="mt-3 text-sm text-red-300">{err}</p>}
      <p className="mt-8 text-center text-xs text-muted">
        Tes check-ins sont enregistrés localement. Rien n'est vendu ni partagé.
      </p>
    </main>
  );
}
