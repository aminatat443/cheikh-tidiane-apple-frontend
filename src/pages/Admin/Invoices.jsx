import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiFileText, FiSearch } from 'react-icons/fi';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { adminService } from '@/services/admin.service';
import { formatPrice, formatDate } from '@/utils/format';
import { PAYMENT_STATUSES } from '@/constants';

const meta = (v) => PAYMENT_STATUSES.find((s) => s.value === v) || { label: v, tone: 'muted' };

export default function Invoices() {
  const [q, setQ] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'orders'], queryFn: () => adminService.orders() });
  const orders = data?.data || [];

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return orders;
    return orders.filter((o) => `${o.reference} ${o.user?.name || ''}`.toLowerCase().includes(t));
  }, [orders, q]);

  return (
    <div>
      <PageHeader
        title="Factures"
        subtitle="Une facture par commande — facture professionnelle (logo + cachet & signature)."
      />

      <div className="relative max-w-sm">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
        <input className="input pl-9" placeholder="N° de facture, client…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {isLoading ? (
        <TableSkeleton cols={6} />
      ) : (
        <div className="card mt-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted dark:bg-primary-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Facture N°</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Montant</th>
                  <th className="px-4 py-3 font-semibold">Règlement</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-white/10">
                {filtered.map((o) => (
                  <tr key={o.id} className="group">
                    <td className="px-4 py-3 font-mono text-xs font-semibold dark:text-white">{o.reference}</td>
                    <td className="px-4 py-3 text-muted">{o.user?.name || '—'}</td>
                    <td className="px-4 py-3 font-semibold dark:text-white">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3"><StatusBadge tone={meta(o.paymentStatus).tone}>{meta(o.paymentStatus).label}</StatusBadge></td>
                    <td className="px-4 py-3 text-muted">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/invoices/${o.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/20">
                        <FiFileText size={14} /> Facture
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState icon={FiFileText} title="Aucune facture" subtitle={q ? 'Aucun résultat pour cette recherche.' : 'Les factures sont générées à partir des commandes.'} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
