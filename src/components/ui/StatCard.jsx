import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { cn } from '@/utils/format';

// Tuile d'icône « linear » (bordure + fond transparent) + halo décoratif, par tonalité.
const TONES = {
  accent: { tile: 'border border-accent/50 text-accent', blob: 'bg-accent' },
  success: { tile: 'border border-success/50 text-success', blob: 'bg-success' },
  warning: { tile: 'border border-warning/50 text-warning', blob: 'bg-warning' },
  danger: { tile: 'border border-danger/50 text-danger', blob: 'bg-danger' },
  primary: { tile: 'border border-primary/40 text-primary dark:border-white/40 dark:text-white', blob: 'bg-primary' },
};

/**
 * Carte statistique réutilisable (dashboard, commandes, Lebalma).
 * - `to`      : rend un lien « Voir → » en bas de carte.
 * - `onClick` : rend la carte cliquable (filtre) avec un libellé + flèche en bas.
 * - `active`  : met la carte en surbrillance (filtre sélectionné).
 */
export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = 'accent',
  to,
  onClick,
  linkLabel,
  active = false,
}) {
  const clickable = typeof onClick === 'function';
  const t = TONES[tone] || TONES.accent;

  return (
    <div
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick(e) : undefined}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-card ring-1 transition-all duration-300 ease-smooth dark:bg-primary-800',
        active ? 'ring-2 ring-accent' : 'ring-line/60 dark:ring-white/10',
        clickable &&
          'cursor-pointer hover:-translate-y-1 hover:shadow-card-hover hover:ring-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
      )}
    >
      {/* Halo décoratif */}
      <span className={cn('pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-[0.08] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.14]', t.blob)} />

      <div className="relative flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        {Icon && (
          <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-105', t.tile)}>
            <Icon size={19} />
          </span>
        )}
      </div>

      <p className="relative mt-3 text-[1.75rem] font-extrabold leading-none tracking-tight dark:text-white">{value ?? 0}</p>
      {sub && <p className="relative mt-1.5 text-xs text-muted">{sub}</p>}

      {(to || clickable) && (
        <div className="relative mt-4 border-t border-line pt-2.5 dark:border-white/10">
          {to ? (
            <Link
              to={to}
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent transition-all group-hover:gap-2"
            >
              {linkLabel || 'Voir le détail'} <FiArrowRight size={13} />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent transition-all group-hover:gap-2">
              {linkLabel || 'Filtrer'} <FiArrowRight size={13} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
