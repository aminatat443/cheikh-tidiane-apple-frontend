import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiTrendingUp, FiShoppingBag, FiUsers, FiSmartphone, FiCreditCard, FiAlertTriangle, FiArrowRight,
} from 'react-icons/fi';
import Loader from '@/components/ui/Loader';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCard from '@/components/ui/StatCard';
import AreaChart from '@/components/ui/AreaChart';
import { adminService } from '@/services/admin.service';
import { formatPrice } from '@/utils/format';
import { ORDER_STATUSES } from '@/constants';

const statusMeta = (v) => ORDER_STATUSES.find((s) => s.value === v) || { label: v, tone: 'muted' };
const productLabel = (o) => {
  const items = o.items || [];
  if (!items.length) return '—';
  return items.length > 1 ? `${items[0].productName} +${items.length - 1}` : items[0].productName;
};

export default function Dashboard() {
  const user = useSelector((s) => s.auth.user);
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminService.dashboard(),
  });

  if (isLoading) return <Loader />;
  const s = data?.data || {};
  const trend = s.salesTrend || [];
  const chartData = trend.map((d) => ({ label: d.label, value: d.revenue }));
  const total14 = trend.reduce((a, d) => a + (d.revenue || 0), 0);
  const firstName = (user?.name || 'Admin').split(' ')[0];
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6">
      {/* Salutation */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight dark:text-white sm:text-3xl">
          Bonjour, {firstName} <span className="align-middle">👋</span>
        </h1>
        <p className="mt-1 text-sm capitalize text-muted">{today}</p>
      </div>

      {/* Cartes statistiques */}
      <div className="stagger-in grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={FiTrendingUp} tone="success" label="Chiffre d'affaires" value={formatPrice(s.revenue)} sub={`Ce mois : ${formatPrice(s.revenueMonth)}`} to="/admin/orders" linkLabel="Voir les commandes" />
        <StatCard icon={FiShoppingBag} label="Commandes" value={s.ordersCount ?? 0} sub={`${s.ordersMonth ?? 0} ce mois-ci`} to="/admin/orders" linkLabel="Gérer les commandes" />
        <StatCard icon={FiCreditCard} tone="warning" label="Contrats Lebalma" value={s.contractsCount ?? 0} sub={`Encours : ${formatPrice(s.lebalmaOutstanding)}`} to="/admin/lebalma" linkLabel="Voir les contrats" />
        <StatCard icon={FiUsers} tone="primary" label="Clients" value={s.clientsCount ?? 0} to="/admin/clients" linkLabel="Voir les clients" />
        <StatCard icon={FiSmartphone} tone="primary" label="Produits" value={s.productsCount ?? 0} to="/admin/products" linkLabel="Gérer le catalogue" />
        <StatCard icon={FiAlertTriangle} tone="warning" label="Stock faible" value={(s.lowStock || []).length} sub="≤ 3 unités" to="/admin/products" linkLabel="Réapprovisionner" />
      </div>

      {/* Graphique — Chiffre d'affaires (14 jours) */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-bold dark:text-white">Chiffre d'affaires</h2>
            <p className="text-xs text-muted">14 derniers jours (commandes payées)</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold tracking-tight text-accent">{formatPrice(total14)}</p>
            <p className="text-xs text-muted">Total sur la période</p>
          </div>
        </div>

        <div className="mt-5">
          <AreaChart data={chartData} height={240} />
          <div className="mt-2 flex justify-between text-[10px] font-medium text-muted">
            {trend.map((d, i) => (
              <span key={d.day} className={i % 2 === 0 ? '' : 'hidden sm:inline'}>{d.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Commandes récentes + Réassort */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold dark:text-white">Commandes récentes</h2>
            <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-accent transition-all hover:gap-2">
              Tout voir <FiArrowRight size={14} />
            </Link>
          </div>
          {(s.recentOrders || []).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Aucune commande pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted">
                    <th className="pb-2 font-semibold">Référence</th>
                    <th className="pb-2 font-semibold">Client</th>
                    <th className="pb-2 font-semibold">Produit</th>
                    <th className="pb-2 font-semibold">Montant</th>
                    <th className="pb-2 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line dark:divide-white/10">
                  {s.recentOrders.map((o) => {
                    const st = statusMeta(o.status);
                    return (
                      <tr key={o.id}>
                        <td className="py-2.5 font-mono text-xs font-semibold dark:text-white">{o.reference}</td>
                        <td className="py-2.5 text-muted">{o.user?.name || '—'}</td>
                        <td className="py-2.5 text-muted">{productLabel(o)}</td>
                        <td className="py-2.5 font-semibold dark:text-white">{formatPrice(o.total)}</td>
                        <td className="py-2.5"><StatusBadge tone={st.tone}>{st.label}</StatusBadge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Réassort */}
        <div className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-bold dark:text-white">
            <FiAlertTriangle className="text-warning" size={18} /> Réassort recommandé
          </h2>
          {(s.lowStock || []).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Stocks suffisants 👍</p>
          ) : (
            <div className="space-y-2.5">
              {s.lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 rounded-xl bg-surface px-3 py-2.5 text-sm dark:bg-primary-800">
                  <span className="min-w-0 truncate font-medium dark:text-white">{p.name}</span>
                  <StatusBadge tone={p.stock === 0 ? 'danger' : 'warning'}>{p.stock} en stock</StatusBadge>
                </div>
              ))}
              <Link to="/admin/products" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-accent transition-all hover:gap-2">
                Gérer le catalogue <FiArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
