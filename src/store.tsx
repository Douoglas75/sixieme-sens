import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { sb, pullCloud, pushCloud, wipeCloud, Cloud } from './cloud';

export const DOMAINS = [
  { id: 'sante', label: 'Santé', emoji: '🏥', color: '#34d399' },
  { id: 'finance', label: 'Finance', emoji: '💶', color: '#fbbf24' },
  { id: 'social', label: 'Social', emoji: '👥', color: '#60a5fa' },
  { id: 'cognitif', label: 'Cognitif', emoji: '🧠', color: '#a78bfa' },
  { id: 'carriere', label: 'Carrière', emoji: '💼', color: '#22d3ee' },
  { id: 'admin', label: 'Administratif', emoji: '📋', color: '#f472b6' },
] as const;

export type DomainId = (typeof DOMAINS)[number]['id'];
export type Scores = Record<DomainId, number>;
export type Tab = 'home' | 'shield' | 'predict' | 'social' | 'settings';

export interface CheckIn { date: string; scores: Scores }
export interface Contact { id: string; name: string; relation: string; phone?: string; lastContact: string }
export interface State {
  onboarded: boolean;
  mode: 'demo' | 'local' | 'google';
  name: string;
  checkins: CheckIn[];
  contacts: Contact[];
  nightMode: boolean;
  focus: { date: string; minutes: number };
}

const KEY = '6s_v3';

export const isoDay = (d = new Date()) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
export const daysSince = (day: string) =>
  Math.max(0, Math.round((new Date(isoDay()).getTime() - new Date(day).getTime()) / 864e5));

const empty = (): State => ({
  onboarded: false, mode: 'local', name: '', checkins: [], contacts: [],
  nightMode: false, focus: { date: isoDay(), minutes: 0 },
});

export function demoState(): State {
  const base: Scores = { sante: 8, finance: 6, social: 5, cognitif: 7, carriere: 7, admin: 8 };
  const checkins: CheckIn[] = [...Array(7)].map((_, i) => {
    const scores = {} as Scores;
    DOMAINS.forEach((d, k) => {
      scores[d.id] = Math.max(1, Math.min(10, Math.round(base[d.id] + Math.sin(i * 1.3 + k) * 1.5)));
    });
    return { date: isoDay(new Date(Date.now() - (6 - i) * 864e5)), scores };
  });
  const back = (n: number) => isoDay(new Date(Date.now() - n * 864e5));
  return {
    ...empty(), onboarded: true, mode: 'demo', name: 'Alex', checkins,
    contacts: [
      { id: 'd1', name: 'Maman', relation: 'Famille', lastContact: back(2) },
      { id: 'd2', name: 'Thomas', relation: 'Ami', lastContact: back(19) },
      { id: 'd3', name: 'Émilie', relation: 'Collègue', lastContact: back(1) },
    ],
  };
}

export const latest = (s: State) => s.checkins[s.checkins.length - 1];
export const average = (sc: Scores) => DOMAINS.reduce((a, d) => a + sc[d.id], 0) / DOMAINS.length;

export interface Insight { id: string; tone: 'warn' | 'info' | 'good'; title: string; text: string }

export function insights(s: State): Insight[] {
  const out: Insight[] = [];
  const last = latest(s);
  if (!last || last.date !== isoDay())
    out.push({ id: 'ci', tone: 'info', title: 'Ton check-in du jour', text: '30 secondes pour mettre à jour tes six sens.' });
  if (last) {
    const low = DOMAINS.map((d) => ({ d, v: last.scores[d.id] })).sort((a, b) => a.v - b.v)[0];
    if (low.v <= 5)
      out.push({ id: 'low', tone: 'warn', title: `${low.d.label} demande de l'attention`, text: `Ton score est de ${low.v}/10. Choisis une petite action pour aujourd'hui.` });
    if (last.scores.sante >= 8 && last.scores.cognitif >= 8)
      out.push({ id: 'good', tone: 'good', title: 'Bonne forme', text: 'Santé et cognitif sont hauts : bon moment pour une tâche exigeante.' });
  }
  s.contacts.forEach((c) => {
    const d = daysSince(c.lastContact);
    if (d >= 14) out.push({ id: 'c' + c.id, tone: 'warn', title: `${c.name} n'a pas de nouvelles`, text: `Dernier contact il y a ${d} jours.` });
  });
  return out;
}

export type SyncState = 'idle' | 'syncing' | 'ok' | 'error';
export interface Account { id: string; email: string }
interface Ctx {
  state: State; update: (p: Partial<State>) => void; reset: () => void;
  account: Account | null; sync: SyncState; logout: () => Promise<void>; wipeAll: () => Promise<void>;
}
const AppCtx = createContext<Ctx>(null as any);
export const useApp = () => useContext(AppCtx);

function mergeState(local: State, cloud: Cloud, email: string): State {
  const days = new Map<string, CheckIn>();
  local.checkins.forEach((c) => days.set(c.date, c));
  cloud.checkins.forEach((c) => days.set(c.date, c));
  const contacts = new Map<string, Contact>();
  local.contacts.forEach((c) => contacts.set(c.id, c));
  cloud.contacts.forEach((c) => contacts.set(c.id, c));
  let focus = local.focus;
  if (cloud.focus && (cloud.focus.date > focus.date || (cloud.focus.date === focus.date && cloud.focus.minutes > focus.minutes))) focus = cloud.focus;
  return {
    ...local,
    onboarded: true,
    mode: local.mode === 'google' ? 'google' : 'local',
    name: local.name || cloud.name || email.split('@')[0],
    checkins: [...days.values()].sort((x, y) => x.date.localeCompare(y.date)).slice(-90),
    contacts: [...contacts.values()],
    focus,
  };
}

export function Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
    } catch { return empty(); }
  });
  const [account, setAccount] = useState<Account | null>(null);
  const [sync, setSync] = useState<SyncState>('idle');
  const [ready, setReady] = useState(false);
  const synced = useRef(false);

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }, [state]);

  // Session Supabase
  useEffect(() => {
    const toAcc = (u: any): Account | null => (u ? { id: u.id, email: u.email || '' } : null);
    sb.auth.getSession().then(({ data }) => setAccount(toAcc(data.session?.user)));
    const { data } = sb.auth.onAuthStateChange((_e, session) => {
      const a = toAcc(session?.user);
      setAccount(a);
      if (!a) { synced.current = false; setReady(false); setSync('idle'); }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Première synchro : on fusionne ce qu'il y a sur l'appareil et dans le cloud
  useEffect(() => {
    if (!account || synced.current || state.mode === 'demo') return;
    synced.current = true;
    setSync('syncing');
    pullCloud(account.id)
      .then((cloud) => { setState((s) => mergeState(s, cloud, account.email)); setReady(true); })
      .catch(() => { synced.current = false; setSync('error'); });
  }, [account]);

  // Ensuite : envoi automatique après chaque changement
  useEffect(() => {
    if (!account || !ready || state.mode === 'demo') return;
    const t = setTimeout(async () => {
      setSync('syncing');
      try { await pushCloud(account.id, state); setSync('ok'); } catch { setSync('error'); }
    }, 1200);
    return () => clearTimeout(t);
  }, [state, account, ready]);

  const update = (p: Partial<State>) => setState((s) => ({ ...s, ...p }));
  const reset = () => { try { localStorage.removeItem(KEY); } catch {} setState(empty()); };
  const logout = async () => { setReady(false); await sb.auth.signOut(); reset(); };
  const wipeAll = async () => {
    setReady(false);
    if (account) { try { await wipeCloud(account.id); } catch {} await sb.auth.signOut(); }
    reset();
  };

  return <AppCtx.Provider value={{ state, update, reset, account, sync, logout, wipeAll }}>{children}</AppCtx.Provider>;
}

export interface AppsStatus { google: boolean; spotify: boolean; weather: boolean; plaid: boolean }
export function useApps() {
  const [apps, setApps] = useState<AppsStatus>({ google: false, spotify: false, weather: false, plaid: false });
  const refresh = () =>
    fetch('/api/apps/status').then((r) => r.json()).then(setApps).catch(() => {});
  useEffect(() => { refresh(); }, []);
  return { apps, refresh };
}

// Ouvre la fenêtre de connexion Google et dit si la connexion a réussi
export function connectGoogle(): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      const r = await fetch('/api/auth/google/url');
      const { url } = await r.json();
      const w = window.open(url, '6s-google', 'width=500,height=650');
      if (!w) return resolve(false);
      const onMsg = (e: MessageEvent) => {
        if (e.origin === location.origin && e.data?.type === 'OAUTH_AUTH_SUCCESS' && e.data.provider === 'google') {
          cleanup(); resolve(true);
        }
      };
      const timer = setInterval(() => {
        if (w.closed) {
          cleanup();
          fetch('/api/apps/status').then((r) => r.json()).then((s) => resolve(!!s.google)).catch(() => resolve(false));
        }
      }, 800);
      const cleanup = () => { window.removeEventListener('message', onMsg); clearInterval(timer); };
      window.addEventListener('message', onMsg);
    } catch { resolve(false); }
  });
}
