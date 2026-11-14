import { ReactNode } from 'react';
import { DOMAINS, Scores } from './store';

export const PANEL = 'rounded-2xl border border-line bg-panel/90';

export function Title({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="px-5 pt-5 pb-3">
      <h1 className="text-2xl font-extrabold tracking-tight">{children}</h1>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
    </div>
  );
}

export function Empty({ icon, title, text, action }: { icon: string; title: string; text: string; action?: ReactNode }) {
  return (
    <div className={`${PANEL} mx-5 p-6 text-center`}>
      <div className="text-3xl">{icon}</div>
      <div className="mt-2 font-semibold">{title}</div>
      <p className="mt-1 text-sm text-muted">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Button({ children, onClick, kind = 'primary', disabled }: { children: ReactNode; onClick?: () => void; kind?: 'primary' | 'ghost' | 'danger'; disabled?: boolean }) {
  const styles = {
    primary: 'bg-gradient-to-r from-violet-600 to-blue-500 text-white',
    ghost: 'border border-line bg-white/5 text-white',
    danger: 'border border-red-500/40 bg-red-500/10 text-red-300',
  }[kind];
  return (
    <button disabled={disabled} onClick={onClick} className={`rounded-xl px-4 py-2.5 text-sm font-semibold active:scale-[.98] disabled:opacity-40 ${styles}`}>
      {children}
    </button>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? 'bg-violet-600' : 'bg-white/15'}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

// L'hexagone des six sens : un sommet par domaine
export function Hexagon({ scores, size = 280 }: { scores: Scores | null; size?: number }) {
  const c = size / 2, R = size * 0.36;
  const pt = (i: number, r: number) => {
    const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    return [c + r * Math.cos(a), c + r * Math.sin(a)] as const;
  };
  const ring = (f: number) => DOMAINS.map((_, i) => pt(i, R * f).join(',')).join(' ');
  const shape = scores ? DOMAINS.map((d, i) => pt(i, R * (scores[d.id] / 10)).join(',')).join(' ') : '';
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto block w-full max-w-[300px]" role="img" aria-label="Hexagone des six sens">
      <defs>
        <linearGradient id="hx" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c3aed" stopOpacity=".75" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity=".55" />
        </linearGradient>
      </defs>
      {[0.33, 0.66, 1].map((f) => <polygon key={f} points={ring(f)} fill="none" stroke="#262650" strokeWidth="1" />)}
      {DOMAINS.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="#262650" />; })}
      {scores && <polygon points={shape} fill="url(#hx)" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round" />}
      {DOMAINS.map((d, i) => {
        const [x, y] = pt(i, R + 26);
        const [vx, vy] = scores ? pt(i, R * (scores[d.id] / 10)) : [0, 0];
        return (
          <g key={d.id}>
            {scores && <circle cx={vx} cy={vy} r="4" fill={d.color} />}
            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="18">{d.emoji}</text>
          </g>
        );
      })}
    </svg>
  );
}
