import { useState } from 'react';
import { sb } from '../cloud';
import { Button } from '../ui';

const fr = (m: string) =>
  /invalid login/i.test(m) ? 'E-mail ou mot de passe incorrect.'
  : /already registered/i.test(m) ? 'Un compte existe déjà avec cet e-mail. Connecte-toi.'
  : /password/i.test(m) ? 'Mot de passe trop court (8 caractères minimum).'
  : /not confirmed/i.test(m) ? "Ton e-mail n'est pas encore confirmé. Regarde ta boîte mail."
  : /rate|too many/i.test(m) ? 'Trop de tentatives. Réessaie dans quelques minutes.'
  : 'Impossible pour le moment. Réessaie.';

export default function AccountForm({ defaultName = '', onBack }: { defaultName?: string; onBack?: () => void }) {
  const [up, setUp] = useState(true);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const input = 'w-full rounded-xl border border-line bg-ink px-4 py-3 outline-none focus:border-violet-500';
  const ok = email.includes('@') && pw.length >= 8 && (!up || name.trim().length > 0);

  const submit = async () => {
    setBusy(true); setMsg('');
    const r = up
      ? await sb.auth.signUp({ email: email.trim(), password: pw, options: { data: { name: name.trim() } } })
      : await sb.auth.signInWithPassword({ email: email.trim(), password: pw });
    setBusy(false);
    if (r.error) return setMsg(fr(r.error.message));
    if (up && !r.data.session) setMsg('Compte créé. Confirme ton e-mail avec le lien que tu viens de recevoir, puis connecte-toi.');
    else setMsg('Connexion réussie, synchronisation…');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2" role="group" aria-label="Mode">
        {[['Créer un compte', true], ['Me connecter', false]].map(([l, v]) => (
          <button key={String(l)} onClick={() => setUp(v as boolean)} aria-pressed={up === v}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${up === v ? 'bg-violet-600' : 'border border-line text-muted'}`}>{l as string}</button>
        ))}
      </div>
      {up && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton prénom" maxLength={30} aria-label="Prénom" className={input} />}
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="Ton e-mail" aria-label="E-mail" className={input} />
      <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" autoComplete={up ? 'new-password' : 'current-password'} placeholder="Mot de passe (8 caractères minimum)" aria-label="Mot de passe" className={input} />
      {msg && <p role="status" className="text-sm text-muted">{msg}</p>}
      <div className="flex gap-2">
        <Button onClick={submit} disabled={!ok || busy}>{busy ? 'Un instant…' : up ? 'Créer mon compte' : 'Me connecter'}</Button>
        {onBack && <Button kind="ghost" onClick={onBack}>Retour</Button>}
      </div>
    </div>
  );
}
