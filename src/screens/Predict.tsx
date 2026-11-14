import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { DOMAINS, DomainId, useApp } from '../store';
import { Title, PANEL, Empty } from '../ui';

export default function Predict() {
  const { state } = useApp();
  const [sel, setSel] = useState<'all' | DomainId>('all');
  const data = state.checkins.slice(-14).map((c) => ({ date: new Date(c.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), ...c.scores }));
  const shown = sel === 'all' ? DOMAINS : DOMAINS.filter((d) => d.id === sel);

  let trend = '';
  if (sel !== 'all' && state.checkins.length >= 2) {
    const vals = state.checkins.map((c) => c.scores[sel]);
    const last = vals[vals.length - 1];
    const prev = vals.slice(0, -1);
    const diff = last - prev.reduce((a, b) => a + b, 0) / prev.length;
    trend = Math.abs(diff) < 0.5 ? 'Stable par rapport à ta moyenne.' : diff > 0 ? `En hausse de ${diff.toFixed(1)} point(s) par rapport à ta moyenne.` : `En baisse de ${Math.abs(diff).toFixed(1)} point(s) par rapport à ta moyenne.`;
  }

  return (
    <>
      <Title sub="L'évolution de tes six sens au fil des jours.">Tendances</Title>
      <div className="flex gap-2 overflow-x-auto px-5 pb-3" role="group" aria-label="Domaine">
        <button onClick={() => setSel('all')} aria-pressed={sel === 'all'} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${sel === 'all' ? 'bg-violet-600' : 'border border-line text-muted'}`}>Tous</button>
        {DOMAINS.map((d) => (
          <button key={d.id} onClick={() => setSel(d.id)} aria-pressed={sel === d.id} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${sel === d.id ? 'bg-violet-600' : 'border border-line text-muted'}`}>{d.emoji} {d.label}</button>
        ))}
      </div>

      {data.length < 2 ? (
        <Empty icon="📈" title="Les tendances arrivent" text="Fais un check-in chaque jour : la courbe apparaît dès le deuxième jour." />
      ) : (
        <section className={`${PANEL} mx-5 p-3`}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#262650" vertical={false} />
                <XAxis dataKey="date" stroke="#9a9ac4" fontSize={11} />
                <YAxis domain={[0, 10]} stroke="#9a9ac4" fontSize={11} />
                <Tooltip contentStyle={{ background: '#12122b', border: '1px solid #262650', borderRadius: 12 }} />
                {shown.map((d) => <Line key={d.id} type="monotone" dataKey={d.id} name={d.label} stroke={d.color} strokeWidth={sel === 'all' ? 1.75 : 3} dot={false} />)}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {trend && <p className="px-2 pb-1 pt-2 text-sm text-muted">{trend}</p>}
        </section>
      )}

      <div className={`${PANEL} mx-5 mt-4 p-4`}>
        <div className="font-semibold">Analyse de liens et de textes</div>
        <p className="mt-1 text-sm text-muted">Vérifier la fiabilité d'un article ou repérer un contenu retouché par IA. Disponible dans une prochaine version.</p>
      </div>
    </>
  );
}
