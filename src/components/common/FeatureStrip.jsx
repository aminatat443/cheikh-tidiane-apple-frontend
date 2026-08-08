import { FiTruck, FiShield, FiLock, FiCreditCard } from 'react-icons/fi';

const ITEMS = [
  { icon: FiTruck, t: 'Livraison rapide', s: 'Dakar & régions' },
  { icon: FiShield, t: 'Garantie officielle', s: 'Produits authentiques' },
  { icon: FiLock, t: 'Paiement sécurisé', s: 'Wave · OM · carte' },
  { icon: FiCreditCard, t: 'Payez en plusieurs fois', s: 'Financement Lebalma' },
];

/** Bandeau de réassurance fin (grille à séparateurs discrets). */
export default function FeatureStrip() {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-line/70 ring-1 ring-line/70 dark:bg-white/10 dark:ring-white/10 lg:grid-cols-4">
      {ITEMS.map(({ icon: Icon, t, s }) => (
        <div key={t} className="flex items-center gap-3.5 bg-white p-5 dark:bg-primary-900">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-accent/40 text-accent">
            <Icon size={19} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-primary dark:text-white">{t}</p>
            <p className="truncate text-xs text-muted">{s}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
