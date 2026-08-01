import { useRef, useState } from 'react';
import { formatPrice } from '@/utils/format';

// Valeur du token `accent` (#0A84FF) — série unique de la courbe.
const ACCENT = '#0A84FF';

/**
 * Courbe (aire) légère et responsive pour une série temporelle unique.
 * Sans dépendance : SVG + survol (croix + info-bulle). Compatible thème sombre.
 * @param {{label:string, value:number}[]} data
 */
export default function AreaChart({ data = [], height = 240 }) {
  const ref = useRef(null);
  const [hi, setHi] = useState(null);

  const n = data.length;
  if (!n) return <div className="grid h-40 place-items-center text-sm text-muted">Aucune donnée</div>;

  const W = 1000;
  const H = 300;
  const pad = 8;
  const max = Math.max(1, ...data.map((d) => d.value));
  const maxS = max * 1.15;
  const xOf = (i) => (n === 1 ? W / 2 : (i / (n - 1)) * W);
  const yOf = (v) => pad + (1 - v / maxS) * (H - 2 * pad);

  const line = data.map((d, i) => `${xOf(i)},${yOf(d.value)}`).join(' ');
  const area = `M0,${H} L ${data.map((d, i) => `${xOf(i)},${yOf(d.value)}`).join(' L ')} L ${W},${H} Z`;
  const grid = [0.25, 0.5, 0.75].map((f) => pad + f * (H - 2 * pad));

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setHi(Math.round(ratio * (n - 1)));
  };

  const active = hi != null ? data[hi] : null;
  const left = hi != null ? (n === 1 ? 50 : (hi / (n - 1)) * 100) : 0;
  const top = active ? (yOf(active.value) / H) * 100 : 0;

  return (
    <div className="relative" style={{ height }} ref={ref} onMouseMove={onMove} onMouseLeave={() => setHi(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id="ct-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.28" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
        </defs>
        {grid.map((gy) => (
          <line key={gy} x1="0" y1={gy} x2={W} y2={gy} stroke="currentColor" strokeWidth="1"
            className="text-line dark:text-white/10" vectorEffect="non-scaling-stroke" />
        ))}
        <path d={area} fill="url(#ct-area)" />
        <polyline points={line} fill="none" stroke={ACCENT} strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {active && (
          <line x1={xOf(hi)} y1="0" x2={xOf(hi)} y2={H} stroke={ACCENT} strokeWidth="1"
            strokeDasharray="4 5" opacity="0.5" vectorEffect="non-scaling-stroke" />
        )}
      </svg>

      {active && (
        <>
          <span
            className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-2 ring-white dark:ring-primary-900"
            style={{ left: `${left}%`, top: `${top}%` }}
          />
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg bg-primary px-2.5 py-1.5 text-center text-xs font-bold text-white shadow-card-hover"
            style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, calc(-100% - 12px))' }}
          >
            <div className="text-[10px] font-medium text-white/60">{active.label}</div>
            {formatPrice(active.value)}
          </div>
        </>
      )}
    </div>
  );
}
