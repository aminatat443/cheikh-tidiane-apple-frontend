import { formatPrice, cn } from '@/utils/format';

const COLORS = [
  { name: 'Noir', hex: '#111827' },
  { name: 'Blanc', hex: '#FFFFFF' },
  { name: 'Bleu', hex: '#0A84FF' },
  { name: 'Vert', hex: '#10B981' },
  { name: 'Rouge', hex: '#EF4444' },
];
const STORAGES = ['64Go', '128Go', '256Go', '512Go', '1To'];

/**
 * Panneau de filtres (chips). Chaque changement remonte via onChange → temps réel.
 * La catégorie est gérée par la barre de chips en haut du catalogue.
 */
export default function ProductFilters({ filters, onChange, onReset }) {
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl bg-white p-5 ring-1 ring-line dark:bg-primary-800 dark:ring-white/10">
        <div className="flex items-center justify-between">
          <h3 className="font-bold dark:text-white">Filtres</h3>
          <button onClick={onReset} className="text-xs font-medium text-accent hover:underline">
            Réinitialiser
          </button>
        </div>

        {/* Prix */}
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold dark:text-white">Prix maximum</p>
          <input
            type="range"
            min="0"
            max="2000000"
            step="50000"
            value={filters.maxPrice || 2000000}
            onChange={(e) => set({ maxPrice: Number(e.target.value) })}
            className="w-full accent-accent"
          />
          <p className="mt-1 text-xs text-muted">Jusqu'à {formatPrice(filters.maxPrice || 2000000)}</p>
        </div>

        {/* Couleur */}
        <div className="mt-6">
          <p className="mb-2.5 text-sm font-semibold dark:text-white">Couleur</p>
          <div className="flex flex-wrap gap-2.5">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => set({ color: filters.color === c.name ? '' : c.name })}
                title={c.name}
                aria-label={c.name}
                className={cn(
                  'h-8 w-8 rounded-full ring-2 ring-offset-2 transition dark:ring-offset-primary-800',
                  filters.color === c.name ? 'ring-accent' : 'ring-line/70 hover:ring-primary'
                )}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* Capacité */}
        <div className="mt-6">
          <p className="mb-2.5 text-sm font-semibold dark:text-white">Capacité</p>
          <div className="flex flex-wrap gap-2">
            {STORAGES.map((s) => (
              <button
                key={s}
                onClick={() => set({ storage: filters.storage === s ? '' : s })}
                className={cn('chip', filters.storage === s && 'chip-active')}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="mt-6 space-y-3 border-t border-line pt-5 dark:border-white/10">
          {[
            { key: 'lebalma', label: 'Éligible Lebalma' },
            { key: 'inStock', label: 'En stock uniquement' },
          ].map(({ key, label }) => (
            <label key={key} className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-sm text-primary-700 dark:text-white/80">{label}</span>
              <input
                type="checkbox"
                checked={!!filters[key]}
                onChange={(e) => set({ [key]: e.target.checked ? 'true' : '' })}
                className="h-4 w-4 accent-accent"
              />
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
