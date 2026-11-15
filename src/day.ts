import { DOMAINS, Scores } from './store';

export interface Wx { t: number; d: string; city: string; kind: string }

const TIPS: Record<string, (wet: boolean) => string> = {
  sante: (wet) => (wet ? 'Quelques étirements à la maison te feront du bien.' : 'Une marche de 15 minutes te fera du bien.'),
  finance: () => 'Prends 5 minutes pour regarder tes dépenses de la semaine.',
  social: () => "Envoie un petit message à un proche aujourd'hui.",
  cognitif: () => 'Lance une session de focus de 25 minutes, puis fais une vraie pause.',
  carriere: () => 'Choisis une seule tâche importante et fais-la en premier.',
  admin: () => 'Traite une démarche en attente, même la plus petite.',
};

// Conseils simples selon la météo et ton hexagone (2 maximum)
export function dayTips(wx: Wx | null, sc?: Scores): string[] {
  const out: string[] = [];
  const wet = !!wx && ['Rain', 'Drizzle', 'Thunderstorm', 'Snow'].includes(wx.kind);
  if (wx) {
    if (wet) out.push('Il risque de mouiller : prévois plus de temps pour tes trajets.');
    else if (wx.t <= 5) out.push('Il fait froid : couvre-toi bien avant de sortir.');
    else if (wx.t >= 30) out.push("Forte chaleur : pense à boire de l'eau régulièrement.");
  }
  if (sc) {
    const low = DOMAINS.map((d) => ({ id: d.id, v: sc[d.id] })).sort((a, b) => a.v - b.v)[0];
    if (low.v <= 5) out.push(TIPS[low.id](wet));
  }
  return out.slice(0, 2);
}
