import { createClient } from '@supabase/supabase-js';
import type { State, CheckIn, Contact } from './store';

// Clés publiques (faites pour être dans l'app) : la sécurité vient des règles RLS de la base
const URL = 'https://rgomrycxcknhdrznmzee.supabase.co';
const KEY = 'sb_publishable_EPEcVsHirJ5j9A49TNejLA_MopUM3rJ';

export const sb = createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true } });

export interface Cloud { name: string; checkins: CheckIn[]; contacts: Contact[]; focus: { date: string; minutes: number } | null }

function check<T extends { error: any }>(r: T): T {
  if (r.error) throw new Error(r.error.message);
  return r;
}

export async function pullCloud(uid: string): Promise<Cloud> {
  const [p, c, k, f] = await Promise.all([
    sb.from('profiles').select('name').eq('id', uid).maybeSingle(),
    sb.from('checkins').select('day,scores').order('day'),
    sb.from('contacts').select('id,name,relation,phone,last_contact'),
    sb.from('focus_days').select('day,minutes').order('day', { ascending: false }).limit(1),
  ]);
  check(p); check(c); check(k); check(f);
  return {
    name: (p.data as any)?.name || '',
    checkins: (c.data || []).map((r: any) => ({ date: r.day, scores: r.scores })),
    contacts: (k.data || []).map((r: any) => ({ id: r.id, name: r.name, relation: r.relation, phone: r.phone || undefined, lastContact: r.last_contact })),
    focus: f.data && f.data[0] ? { date: (f.data[0] as any).day, minutes: (f.data[0] as any).minutes } : null,
  };
}

export async function pushCloud(uid: string, s: State) {
  check(await sb.from('profiles').upsert({ id: uid, name: s.name }));
  if (s.checkins.length)
    check(await sb.from('checkins').upsert(s.checkins.map((c) => ({ user_id: uid, day: c.date, scores: c.scores })), { onConflict: 'user_id,day' }));
  if (s.contacts.length)
    check(await sb.from('contacts').upsert(s.contacts.map((c) => ({ id: c.id, user_id: uid, name: c.name, relation: c.relation, phone: c.phone || null, last_contact: c.lastContact }))));
  const ids = s.contacts.map((c) => c.id);
  const del = sb.from('contacts').delete().eq('user_id', uid);
  check(await (ids.length ? del.not('id', 'in', `(${ids.join(',')})`) : del));
  check(await sb.from('focus_days').upsert({ user_id: uid, day: s.focus.date, minutes: s.focus.minutes }, { onConflict: 'user_id,day' }));
}

export async function wipeCloud(uid: string) {
  check(await sb.from('checkins').delete().eq('user_id', uid));
  check(await sb.from('contacts').delete().eq('user_id', uid));
  check(await sb.from('focus_days').delete().eq('user_id', uid));
  check(await sb.from('profiles').update({ name: '' }).eq('id', uid));
}
