import { FiClipboard, FiCheckCircle, FiPackage, FiTruck, FiHome, FiXCircle, FiRotateCcw } from 'react-icons/fi';
import { cn } from '@/utils/format';

// Étapes du suivi (style Jumia) — séquence linéaire.
const STEPS = [
  { key: 'pending', label: 'Commande reçue', icon: FiClipboard },
  { key: 'paid', label: 'Confirmée', icon: FiCheckCircle },
  { key: 'processing', label: 'En préparation', icon: FiPackage },
  { key: 'shipped', label: 'Expédiée', icon: FiTruck },
  { key: 'delivered', label: 'Livrée', icon: FiHome },
];
const RANK = { pending: 0, paid: 1, processing: 2, shipped: 3, delivered: 4 };

/** Suivi visuel d'une commande (barre d'étapes horizontale + timeline mobile). */
export default function OrderTracker({ status }) {
  if (status === 'cancelled') {
    return <StateBanner icon={FiXCircle} tone="danger" title="Commande annulée" text="Cette commande a été annulée." />;
  }
  if (status === 'returned') {
    return <StateBanner icon={FiRotateCcw} tone="muted" title="Commande retournée" text="Cette commande a fait l'objet d'un retour." />;
  }

  const current = RANK[status] ?? 0;

  return (
    <div>
      {/* Desktop / tablette : barre horizontale */}
      <ol className="hidden items-start sm:flex">
        {STEPS.map((s, i) => {
          const done = i <= current;
          const isCurrent = i === current;
          const Icon = done && !isCurrent ? FiCheckCircle : s.icon;
          return (
            <li key={s.key} className="relative flex flex-1 flex-col items-center text-center">
              {i > 0 && (
                <span
                  className={cn(
                    'absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2',
                    i <= current ? 'bg-accent' : 'bg-line dark:bg-white/10'
                  )}
                />
              )}
              <span
                className={cn(
                  'relative z-10 grid h-8 w-8 place-items-center rounded-full ring-4 ring-white transition dark:ring-primary-900',
                  done ? 'bg-accent text-white' : 'bg-surface text-muted dark:bg-primary-800',
                  isCurrent && 'shadow-glow'
                )}
              >
                <Icon size={15} />
              </span>
              <span className={cn('mt-2 max-w-[80px] text-[11px] font-medium leading-tight', done ? 'text-primary dark:text-white' : 'text-muted')}>
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Mobile : timeline verticale */}
      <ol className="sm:hidden">
        {STEPS.map((s, i) => {
          const done = i <= current;
          const isCurrent = i === current;
          const last = i === STEPS.length - 1;
          const Icon = done && !isCurrent ? FiCheckCircle : s.icon;
          return (
            <li key={s.key} className="relative flex gap-3 pb-5 last:pb-0">
              {!last && (
                <span
                  className={cn(
                    'absolute left-4 top-8 h-full w-0.5 -translate-x-1/2',
                    i < current ? 'bg-accent' : 'bg-line dark:bg-white/10'
                  )}
                />
              )}
              <span
                className={cn(
                  'relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full',
                  done ? 'bg-accent text-white' : 'bg-surface text-muted dark:bg-primary-800'
                )}
              >
                <Icon size={15} />
              </span>
              <div className="pt-1.5">
                <p className={cn('text-sm font-semibold', done ? 'text-primary dark:text-white' : 'text-muted')}>{s.label}</p>
                {isCurrent && <p className="text-xs font-medium text-accent">Étape en cours</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StateBanner({ icon: Icon, tone, title, text }) {
  const tones = {
    danger: 'bg-danger/10 text-danger',
    muted: 'bg-surface text-muted dark:bg-primary-800',
  };
  return (
    <div className={cn('flex items-center gap-3 rounded-xl px-4 py-3', tones[tone])}>
      <Icon size={20} className="shrink-0" />
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs opacity-80">{text}</p>
      </div>
    </div>
  );
}
