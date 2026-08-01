import { cn } from '@/utils/format';

const TONES = {
  success: 'bg-success/10 text-success ring-success/20',
  danger: 'bg-danger/10 text-danger ring-danger/20',
  warning: 'bg-warning/10 text-warning ring-warning/20',
  accent: 'bg-accent/10 text-accent ring-accent/20',
  muted: 'bg-primary-100 text-primary-600 ring-line dark:bg-white/10 dark:text-white/70 dark:ring-white/10',
};

/**
 * Pastille de statut colorée.
 * @param {boolean} dot - affiche une pastille de couleur en tête (statut lisible).
 */
export default function StatusBadge({ tone = 'muted', children, className, dot = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        TONES[tone] || TONES.muted,
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
