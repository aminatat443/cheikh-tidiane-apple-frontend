/**
 * État vide illustré : icône + titre + message + action optionnelle.
 */
export default function EmptyState({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon && (
        <span className="mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-line text-muted dark:border-white/10">
          <Icon size={28} />
        </span>
      )}
      <p className="font-semibold text-primary dark:text-white">{title}</p>
      {subtitle && <p className="mt-1 max-w-sm text-sm text-muted">{subtitle}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
