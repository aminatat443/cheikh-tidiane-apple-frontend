import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FiEye, FiFileText, FiSearch, FiClock, FiCheckCircle, FiTruck, FiPackage, FiX, FiShoppingBag,
} from 'react-icons/fi';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { adminService } from '@/services/admin.service';
import { formatPrice, formatDate } from '@/utils/format';
import { ORDER_STATUSES, PAYMENT_STATUSES, PAYMENT_METHOD_LABELS } from '@/constants';

const meta = (list, v) => list.find((s) => s.value === v) || { label: v, tone: 'muted' };

const STATUS_CARDS = [
  { value: 'pending', label: 'En attente', tone: 'warning', icon: FiClock },
  { value: 'paid', label: 'Payées', tone: 'success', icon: FiCheckCircle },
  { value: 'shipped', label: 'Expédiées', tone: 'accent', icon: FiTruck },
  { value: 'delivered', label: 'Livrées', tone: 'success', icon: FiPackage },
];

export default function Orders() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: ['admin', 'orders'], queryFn: () => adminService.orders() });
  const orders = data?.data || [];

  const counts = useMemo(() => {
    const c = {};
    orders.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (!t) return true;
      return `${o.reference} ${o.user?.name || ''} ${o.user?.email || ''}`.toLowerCase().includes(t);
    });
  }, [orders, q, statusFilter]);

  async function change(order, patch) {
    setBusy(order.id);
    try {
      await adminService.updateOrderStatus(order.id, patch);
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <PageHeader title="Commandes" subtitle={`${orders.length} commande(s) au total.`} />

      {/* 4 cartes de statut (cliquables = filtre) */}
      <div className="stagger-in mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATUS_CARDS.map((c) => (
          <StatCard
            key={c.value}
            icon={c.icon}
            tone={c.tone}
            label={c.label}
            value={counts[c.value] || 0}
            active={statusFilter === c.value}
            onClick={() => setStatusFilter((v) => (v === c.value ? null : c.value))}
            linkLabel={statusFilter === c.value ? 'Filtre actif' : 'Filtrer'}
          />
        ))}
      </div>

      {/* Recherche + filtre actif */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input className="input pl-9" placeholder="Référence, client…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {statusFilter && (
          <button onClick={() => setStatusFilter(null)} className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-sm font-semibold text-accent">
            {meta(ORDER_STATUSES, statusFilter).label} <FiX size={14} />
          </button>
        )}
      </div>

      {isLoading ? (
        <TableSkeleton cols={7} />
      ) : (
        <div className="card mt-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted dark:bg-primary-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Référence</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Mode de paiement</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-white/10">
                {filtered.map((o) => (
                  <tr key={o.id} className="group">
                    <td className="px-4 py-3 font-mono text-xs font-semibold dark:text-white">{o.reference}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium dark:text-white">{o.user?.name || '—'}</p>
                      <p className="text-xs text-muted">{o.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold dark:text-white">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3 text-muted">{PAYMENT_METHOD_LABELS[o.paymentMethod] || o.paymentMethod || '—'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        disabled={busy === o.id}
                        onChange={(e) => change(o, { status: e.target.value })}
                        className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-medium dark:border-white/15 dark:bg-primary-800 dark:text-white"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        <button onClick={() => setDetail(o)} className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-accent/10 hover:text-accent" aria-label="Détails">
                          <FiEye size={16} />
                        </button>
                        <Link to={`/admin/invoices/${o.id}`} className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-accent/10 hover:text-accent" aria-label="Facture">
                          <FiFileText size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState icon={FiShoppingBag} title="Aucune commande" subtitle={q || statusFilter ? 'Aucun résultat pour ce filtre.' : 'Les commandes apparaîtront ici.'} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Détail commande */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Commande ${detail?.reference || ''}`} size="md">
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={meta(ORDER_STATUSES, detail.status).tone}>{meta(ORDER_STATUSES, detail.status).label}</StatusBadge>
              <StatusBadge tone={meta(PAYMENT_STATUSES, detail.paymentStatus).tone}>Règlement : {meta(PAYMENT_STATUSES, detail.paymentStatus).label}</StatusBadge>
              {detail.isLebalma && <StatusBadge tone="accent">Lebalma</StatusBadge>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-surface p-4 text-sm dark:bg-primary-800">
                <p className="mb-1 font-semibold dark:text-white">Client</p>
                <p className="text-muted">{detail.user?.name}</p>
                <p className="text-muted">{detail.user?.email}</p>
              </div>
              <div className="rounded-xl bg-surface p-4 text-sm dark:bg-primary-800">
                <p className="mb-1 font-semibold dark:text-white">Livraison</p>
                <p className="text-muted">{detail.shippingName || '—'}</p>
                <p className="text-muted">{detail.shippingPhone}</p>
                <p className="text-muted">{[detail.shippingAddress, detail.shippingCity].filter(Boolean).join(', ')}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 font-semibold dark:text-white">Articles</p>
              <div className="divide-y divide-line rounded-xl ring-1 ring-line dark:divide-white/10 dark:ring-white/10">
                {(detail.items || []).map((it) => (
                  <div key={it.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span className="dark:text-white">
                      {it.productName}
                      {(it.storage || it.color) && (
                        <span className="text-muted"> — {[it.storage, it.color].filter(Boolean).join(' · ')}</span>
                      )}
                      <span className="text-muted"> × {it.quantity}</span>
                    </span>
                    <span className="font-semibold dark:text-white">{formatPrice(it.unitPrice * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-muted"><span>Sous-total</span><span>{formatPrice(detail.subtotal)}</span></div>
              <div className="flex justify-between text-muted"><span>Livraison</span><span>{formatPrice(detail.shippingFee)}</span></div>
              <div className="flex justify-between text-base font-bold dark:text-white"><span>Total</span><span>{formatPrice(detail.total)}</span></div>
            </div>

            <div className="flex justify-end">
              <Link to={`/admin/invoices/${detail.id}`} className="btn-primary"><FiFileText /> Voir la facture</Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
