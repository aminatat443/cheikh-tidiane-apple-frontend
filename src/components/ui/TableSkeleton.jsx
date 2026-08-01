/**
 * Squelette de chargement pour les tables (ressenti plus rapide qu'un spinner).
 */
export default function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="card mt-5 overflow-hidden">
      <div className="border-b border-line px-4 py-3.5 dark:border-white/10">
        <div className="skeleton h-4 w-44 rounded-md" />
      </div>
      <div className="divide-y divide-line dark:divide-white/10">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-3.5">
            <div className="skeleton h-9 w-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton h-3.5 rounded-md" style={{ width: `${45 + ((r * 17) % 35)}%` }} />
              <div className="skeleton h-3 w-24 rounded-md" />
            </div>
            {Array.from({ length: Math.max(0, cols - 2) }).map((_, c) => (
              <div key={c} className="skeleton hidden h-3.5 w-16 rounded-md sm:block" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
