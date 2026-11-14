import { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Moon } from 'lucide-react';
import { useApp, isoDay } from '../store';
import { Title, PANEL, Toggle } from '../ui';

export default function Focus() {
  const { state, update } = useApp();
  const [minutes, setMinutes] = useState(25);
  const [left, setLeft] = useState(25 * 60);
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!run) return;
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [run]);

  useEffect(() => {
    if (left > 0) return;
    setRun(false); setLeft(minutes * 60);
    navigator.vibrate?.([200, 100, 200]);
    const t = isoDay();
    const prev = state.focus.date === t ? state.focus.minutes : 0;
    update({ focus: { date: t, minutes: prev + minutes } });
  }, [left]);

  const pick = (m: number) => { setMinutes(m); setLeft(m * 60); setRun(false); };
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0');
  const today = state.focus.date === isoDay() ? state.focus.minutes : 0;

  return (
    <>
      <Title sub="Des sessions courtes pour protéger ton attention.">Bouclier</Title>
      <section className={`${PANEL} mx-5 p-6 text-center`}>
        <div className="font-mono text-6xl font-bold tabular-nums" aria-live="off">{mm}:{ss}</div>
        <div className="mt-4 flex justify-center gap-2" role="group" aria-label="Durée">
          {[15, 25, 45].map((m) => (
            <button key={m} onClick={() => pick(m)} aria-pressed={minutes === m}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${minutes === m ? 'bg-violet-600' : 'border border-line text-muted'}`}>{m} min</button>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-center gap-4">
          <button onClick={() => { setRun(false); setLeft(minutes * 60); }} aria-label="Réinitialiser" className="grid h-12 w-12 place-items-center rounded-full border border-line"><RotateCcw size={18} /></button>
          <button onClick={() => setRun(!run)} aria-label={run ? 'Pause' : 'Démarrer'} className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-ink">
            {run ? <Pause /> : <Play />}
          </button>
        </div>
        <p className="mt-5 text-sm text-muted">Focus aujourd'hui : <b className="text-white">{today} min</b></p>
      </section>

      <div className={`${PANEL} mx-5 mt-4 flex items-center gap-3 p-4`}>
        <Moon className="text-indigo-300" />
        <div className="flex-1"><div className="font-semibold">Mode nuit</div><div className="text-xs text-muted">Teinte chaude pour reposer les yeux avant de dormir.</div></div>
        <Toggle on={state.nightMode} onChange={(v) => update({ nightMode: v })} label="Mode nuit" />
      </div>
      <p className="mx-5 mt-4 text-xs text-muted">L'alerte anti-scroll demande l'app mobile native : elle viendra plus tard.</p>
    </>
  );
}
