import { DOMAINS, Scores, average } from './store';

// Dessine la carte de partage (1080x1350) et renvoie une image PNG
async function makeCard(scores: Scores): Promise<Blob> {
  try { await document.fonts.load('800 100px Inter'); } catch {}
  const W = 1080, H = 1350;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d')!;
  const font = (w: number, s: number) => `${w} ${s}px Inter, system-ui, sans-serif`;

  const bg = c.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0a0a1a'); bg.addColorStop(1, '#241356');
  c.fillStyle = bg; c.fillRect(0, 0, W, H);
  const glow = c.createRadialGradient(W / 2, 700, 40, W / 2, 700, 560);
  glow.addColorStop(0, 'rgba(124,58,237,.35)'); glow.addColorStop(1, 'rgba(124,58,237,0)');
  c.fillStyle = glow; c.fillRect(0, 0, W, H);

  c.textAlign = 'center';
  c.fillStyle = '#c4b5fd'; c.font = font(600, 40);
  c.fillText('MON SCORE DE VIE AUJOURD\'HUI', W / 2, 130);
  c.fillStyle = '#fff'; c.font = font(800, 190);
  c.fillText(average(scores).toFixed(1), W / 2 - 40, 330);
  c.fillStyle = '#9a9ac4'; c.font = font(600, 56);
  c.fillText('/ 10', W / 2 + 190, 330);

  const cx = W / 2, cy = 760, R = 290;
  const pt = (i: number, r: number): [number, number] => {
    const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const poly = (f: number, vals?: number[]) => {
    c.beginPath();
    DOMAINS.forEach((_, i) => { const [x, y] = pt(i, vals ? R * vals[i] / 10 : R * f); i ? c.lineTo(x, y) : c.moveTo(x, y); });
    c.closePath();
  };
  c.strokeStyle = '#3a3a78'; c.lineWidth = 2;
  [0.33, 0.66, 1].forEach((f) => { poly(f); c.stroke(); });
  DOMAINS.forEach((_, i) => { const [x, y] = pt(i, R); c.beginPath(); c.moveTo(cx, cy); c.lineTo(x, y); c.stroke(); });

  const vals = DOMAINS.map((d) => scores[d.id]);
  const fill = c.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
  fill.addColorStop(0, 'rgba(124,58,237,.85)'); fill.addColorStop(1, 'rgba(59,130,246,.65)');
  poly(0, vals); c.fillStyle = fill; c.fill();
  c.strokeStyle = '#a78bfa'; c.lineWidth = 6; c.lineJoin = 'round'; c.stroke();

  DOMAINS.forEach((d, i) => {
    const [vx, vy] = pt(i, R * vals[i] / 10);
    c.beginPath(); c.arc(vx, vy, 11, 0, Math.PI * 2); c.fillStyle = d.color; c.fill();
    const [lx, ly] = pt(i, R + 88);
    c.font = font(400, 54); c.fillStyle = '#fff'; c.fillText(d.emoji, lx, ly + 12);
    c.font = font(800, 40); c.fillStyle = d.color; c.fillText(String(vals[i]), lx, ly + 62);
  });

  c.fillStyle = '#fff'; c.font = font(800, 64);
  c.fillText('Sixième Sens', W / 2, 1180);
  c.fillStyle = '#9a9ac4'; c.font = font(500, 36);
  c.fillText('Découvre ton hexagone : santé, finance, social,', W / 2, 1235);
  c.fillText('cognitif, carrière, administratif', W / 2, 1280);

  return new Promise((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error('image'))), 'image/png'));
}

export async function shareScore(scores: Scores): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const blob = await makeCard(scores);
  const file = new File([blob], 'mon-hexagone.png', { type: 'image/png' });
  const text = `Mon score de vie aujourd'hui : ${average(scores).toFixed(1)}/10. Calcule le tien sur ${location.origin}`;
  try {
    if ((navigator as any).canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text });
      return 'shared';
    }
  } catch (e: any) {
    if (e?.name === 'AbortError') return 'cancelled';
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'mon-hexagone.png'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  return 'downloaded';
}
