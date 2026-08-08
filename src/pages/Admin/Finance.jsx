import { useQuery } from '@tanstack/react-query';
import { FiCalendar, FiDollarSign, FiTrendingUp, FiShoppingBag, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import AreaChart from '@/components/ui/AreaChart';
import Loader from '@/components/ui/Loader';
import { adminService } from '@/services/admin.service';
import { formatPrice, cn } from '@/utils/format';

const METHOD_LABELS = {
  wave: 'Wave',
  orange_money: 'Orange Money',
  card: 'Carte bancaire',
  lebalma: 'Lebalma',
  autre: 'Autre',
};

export default function Finance() {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'finance'], queryFn: () => adminService.finance() });
  const f = data?.data;

  if (isLoading) return <Loader />;
  if (!f) return null;

  const chart = (f.revenueByMonth || []).map((m) => ({ label: m.label, value: m.revenue }));
  const maxMethod = Math.max(1, ...(f.revenueByMethod || []).map((m) => m.revenue));
  const up = f.growthPercent >= 0;

  return (
    <div>
      <PageHeader title="Finance" subtitle="Chiffre d'affaires, tendance et encaissements de la boutique." />

      {/* Indicateurs clés */}
      <div className="stagger-in mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FiCalendar}
          tone="accent"
          label="CA du mois"
          value={formatPrice(f.revenueMonth)}
          sub={`${up ? '+' : ''}${f.growthPercent}% vs mois dernier`}
        />
        <StatCard
          icon={FiDollarSign}
          tone="success"
          label="CA total"
          value={formatPrice(f.revenueTotal)}
          sub={`${f.paidOrdersCount} commande(s) payée(s)`}
        />
        <StatCard icon={FiTrendingUp} tone="primary" label="CA aujourd'hui" value={formatPrice(f.revenueToday)} />
        <StatCard icon={FiShoppingBag} tone="warning" label="Panier moyen" value={formatPrice(f.avgOrderValue)} />
      </div>

      {/* Tendance 12 mois */}
      <div className="card mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold dark:text-white">Chiffre d'affaires</h2>
            <p className="text-xs text-muted">12 derniers mois — commandes payées</p>
          </div>
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
            up ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger')}>
            {up ? <FiArrowUp size={13} /> : <FiArrowDown size={13} />} {Math.abs(f.growthPercent)}%
          </span>
        </div>
        <AreaChart data={chart} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Répartition par mode de paiement */}
        <div className="card p-6">
          <h2 className="mb-4 font-bold dark:text-white">Répartition par mode de paiement</h2>
          <div className="space-y-4">
            {(f.revenueByMethod || []).map((m) => (
              <div key={m.method}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium dark:text-white">{METHOD_LABELS[m.method] || m.method}</span>
                  <span className="text-muted">{formatPrice(m.revenue)} · {m.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface dark:bg-primary-800">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.round((m.revenue / maxMethod) * 100)}%` }} />
                </div>
              </div>
            ))}
            {!(f.revenueByMethod || []).length && <p className="text-sm text-muted">Aucune donnée pour le moment.</p>}
          </div>
        </div>

        {/* Financement Lebalma */}
        <div className="card p-6">
          <h2 className="mb-4 font-bold dark:text-white">Financement Lebalma</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-surface p-4 dark:bg-primary-800">
              <p className="text-xs text-muted">Déjà encaissé</p>
              <p className="mt-1 text-xl font-extrabold text-success">{formatPrice(f.lebalmaCollected)}</p>
            </div>
            <div className="rounded-2xl bg-surface p-4 dark:bg-primary-800">
              <p className="text-xs text-muted">Encours à recevoir</p>
              <p className="mt-1 text-xl font-extrabold text-warning">{formatPrice(f.lebalmaOutstanding)}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">
            L'encours correspond aux échéances non encore réglées sur les contrats Lebalma.
          </p>
        </div>
      </div>
    </div>
  );
}
