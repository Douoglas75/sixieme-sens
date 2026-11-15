import { useEffect, useState } from 'react';
import { Footprints, CloudSun, X } from 'lucide-react';
import { DOMAINS, Scores, Tab, useApp, useApps, latest, average, insights, isoDay } from '../store';
import { Hexagon, PANEL, Button, Empty } from '../ui';

function CheckInSheet({ onClose }: { onClose: () => void }) {
  const { state, update } = useApp();
  const last = latest(state);
  const [v, setV] = useState<Scores>(last ? { ...last.scores } : { sante: 5, finance: 5, social: 5, cognitif: 5, carriere: 5, admin: 5 });
  const save = () => {
    const t = isoDay();
    const rest = state.checkins.filter((c) => c.date !== t);
    update({ checkins: [...rest, { date: t, scores: v }].sort((a, b) => a.date.localeCompare(b.date)).slice(-90) });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" role="dialog" aria-modal="true" aria-label="Check-in du jour">
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-line bg-panel p-5" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Comment vas-tu aujourd'hui ?</h2>
          <button onClick={onClose} aria-label="Fermer" className="text-muted"><X /></button>
        </div>
        <div className="mt-4 space-y-4">
          {DOMAINS.map((d) => (
            <div key={d.id}>
              <div className="flex justify-between text-sm"><span>{d.emoji} {d.label}</span><b style={{ color: d.color }}>{v[d.id]}/10</b></div>
              <input type="range" min={1} max={10} value={v[d.id]} onChange={(e) => setV({ ...v, [d.id]: +e.target.value })}
                aria-label={d.label} className="mt-1 w-full accent-violet-500" />
            </div>
          ))}
        </div>
        <div className="mt-5"><Button onClick={save}>Enregistrer</Button></div>
      </div>
    </div>
  );
}

export default function Home({ goto }: { goto: (t: Tab) => void }) {
  const { state } = useApp();
  const { apps } = useApps();
  const [sheet, setSheet] = useState(false);
  const [steps, setSteps] = useState<number | null>(null);
  const [wx, setWx] = useState<{ t: number; d: string; city: string } | null>(null);
  const [wxMsg, setWxMsg] = useState('');

  const last = latest(state);
  const done = last && last.date === isoDay();
  const list = insights(state);
  const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  useEffect(() => {
    if (!apps.google) return;
    fetch('/api/data/google/fit').then((r) => (r.ok ? r.json() : null)).then((j) => j && setSteps(j.steps)).catch(() => {});
  }, [apps.google]);

  const loadWeather = () => {
    setWxMsg('');
    if (!navigator.geolocation) return setWxMsg("La localisation n'est pas disponible sur cet appareil.");
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        try {
          const r = await fetch(`/api/data/weather?lat=${p.coords.latitude}&lon=${p.coords.longitude}`);
          if (!r.ok) return setWxMsg("La météo n'est pas encore configurée sur le serveur.");
          const j = await r.json();
          setWx({ t: Math.round(j.main.temp), d: j.weather?.[0]?.description || '', city: j.name || '' });
        } catch { setWxMsg('Météo indisponible pour le moment.'); }
      },
      () => setWxMsg("Autorise la localisation pour voir la météo."),
      { timeout: 8000 }
    );
  };

  const act = (i: { id: string }) =>
    i.id === 'ci' ? <div className="mt-3"><Button onClick={() => setSheet(true)}>Faire mon check-in</Button></div>
    : i.id.startsWith('c') ? <div className="mt-3"><Button kind="ghost" onClick={() => goto('social')}>Voir mes relations</Button></div>
    : null;
  const tone = (t: string) => (t === 'warn' ? '#f59e0b' : t === 'good' ? '#34d399' : '#60a5fa');
  const top = list[0];

  return (
    <>
      <div className="px-5 pt-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Bonjour {state.name}</h1>
        <p className="text-sm capitalize text-muted">{date}</p>
      </div>


      <section className="mx-5 mt-4 rounded-2xl bg-gradient-to-br from-violet-600/40 to-blue-500/30 p-[1px]" aria-label="Priorité du jour">
        <div className="rounded-2xl bg-panel p-4">
          <div className="text-xs font-semibold text-violet-300">Ta priorité du jour</div>
          {top ? (
            <>
              <div className="mt-1 text-lg font-bold">{top.title}</div>
              <p className="mt-1 text-sm text-muted">{top.text}</p>
              {act(top)}
            </>
          ) : (
            <>
              <div className="mt-1 text-lg font-bold">Tout va bien aujourd'hui</div>
              <p className="mt-1 text-sm text-muted">Rien d'urgent. Profite de ta journée.</p>
            </>
          )}
        </div>
      </section>

      <section className={`${PANEL} mx-5 mt-4 px-4 pb-5 pt-3`} aria-label="Score de vie">
        <Hexagon scores={last ? last.scores : null} />
        <div className="-mt-2 text-center">
          {last ? (
            <>
              <div className="text-5xl font-extrabold tracking-tight">{average(last.scores).toFixed(1)}<span className="text-lg font-semibold text-muted"> / 10</span></div>
              <p className="text-sm text-muted">Ton score de vie{done ? " aujourd'hui" : ` au ${new Date(last.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`}</p>
            </>
          ) : <p className="text-sm text-muted">Ton hexagone se dessine après ton premier check-in.</p>}
          <div className="mt-4"><Button onClick={() => setSheet(true)}>{done ? 'Modifier mon check-in' : 'Faire mon check-in'}</Button></div>
        </div>
        {last && (
          <ul className="mt-5 space-y-2">
            {DOMAINS.map((d) => (
              <li key={d.id} className="flex items-center gap-3 text-sm">
                <span className="w-28">{d.emoji} {d.label}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full" style={{ width: `${last.scores[d.id] * 10}%`, background: d.color }} /></span>
                <b className="w-6 text-right">{last.scores[d.id]}</b>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(apps.google || steps !== null) && (
        <div className={`${PANEL} mx-5 mt-4 flex items-center gap-3 p-4`}>
          <Footprints className="text-emerald-400" />
          <div><div className="font-semibold">{steps !== null ? steps.toLocaleString('fr-FR') : '…'} pas</div><div className="text-xs text-muted">Aujourd'hui, via Google Fit</div></div>
        </div>
      )}

      <div className={`${PANEL} mx-5 mt-4 p-4`}>
        <div className="flex items-center gap-3">
          <CloudSun className="text-sky-300" />
          {wx ? <div><div className="font-semibold">{wx.t}°C, {wx.d}</div><div className="text-xs text-muted">{wx.city}</div></div>
            : <div className="flex-1"><div className="font-semibold">Météo autour de toi</div><div className="text-xs text-muted">Position utilisée seulement à ta demande.</div></div>}
          {!wx && <Button kind="ghost" onClick={loadWeather}>Afficher</Button>}
        </div>
        {wxMsg && <p className="mt-2 text-xs text-amber-200">{wxMsg}</p>}
      </div>

      {list.length > 1 && (
        <>
          <h2 className="mt-6 px-5 text-lg font-bold">À surveiller</h2>
          <div className="mt-2 space-y-3">
            {list.slice(1).map((i) => (
              <div key={i.id} className={`${PANEL} mx-5 border-l-4 p-4`} style={{ borderLeftColor: tone(i.tone) }}>
                <div className="font-semibold">{i.title}</div>
                <p className="mt-1 text-sm text-muted">{i.text}</p>
                {act(i)}
              </div>
            ))}
          </div>
        </>
      )}
      {sheet && <CheckInSheet onClose={() => setSheet(false)} />}
    </>
  );
}
