import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FiEye, FiSearch, FiX, FiClock, FiCheckCircle, FiXCircle, FiDollarSign, FiRotateCcw,
} from 'react-icons/fi';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { adminService } from '@/services/admin.service';
import { formatPrice, formatDate } from '@/utils/format';
import { RETURN_STATUSES } from '@/constants';

const meta = (v) => RETURN_STATUSES.find((s) => s.value === v) || { label: v, tone: 'muted' };

const STATUS_CARDS = [
  { value: 'requested', label: 'À traiter', tone: 'warning', icon: FiClock },
  { value: 'approved', label: 'Approuvées', tone: 'accent', icon: FiCheckCircle },
  { value: 'rejected', label: 'Refusées', tone: 'danger', icon: FiXCircle },
  { value: 'refunded', label: 'Remboursées', tone: 'success', icon: FiDollarSign },
];

export default function Returns() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [detail, setDetail] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['admin', 'returns'], queryFn: () => adminService.returns() });
  const returns = data?.data || [];

  const counts = useMemo(() => {
    const c = {};
    returns.forEach((r) => { c[r.status] = (c[r.status] || 0) + 1; });
    return c;
  }, [returns]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return returns.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (!t) return true;
      return `${r.reference} ${r.order?.reference || ''} ${r.user?.name || ''} ${r.user?.email || ''}`
        .toLowerCase()
        .includes(t);
    });
  }, [returns, q, statusFilter]);

  function openDetail(r) {
    setDetail(r);
    setNote(r.adminNote || '');
    setError('');
  }

  async function updateStatus(status) {
    if (!detail) return;
    setBusy(true);
    setError('');
    try {
      await adminService.updateReturnStatus(detail.id, { status, adminNote: note });
      qc.invalidateQueries({ queryKey: ['admin', 'returns'] });
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setDetail(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Mise à jour impossible pour le moment');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Retours" subtitle={`${returns.length} demande(s) de retour au total.`} />

      {/* Cartes de statut (cliquables = filtre) */}
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
          <input className="input pl-9" placeholder="Référence, commande, client…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {statusFilter && (
          <button onClick={() => setStatusFilter(null)} className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-sm font-semibold text-accent">
            {meta(statusFilter).label} <FiX size={14} />
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
                  <th className="px-4 py-3 font-semibold">Commande</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Montant</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-white/10">
                {filtered.map((r) => {
                  const st = meta(r.status);
                  return (
                    <tr key={r.id} className="group">
                      <td className="px-4 py-3 font-mono text-xs font-semibold dark:text-white">{r.reference}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">{r.order?.reference || '—'}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium dark:text-white">{r.user?.name || '—'}</p>
                        <p className="text-xs text-muted">{r.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold dark:text-white">{formatPrice(r.refundAmount)}</td>
                      <td className="px-4 py-3"><StatusBadge tone={st.tone}>{st.label}</StatusBadge></td>
                      <td className="px-4 py-3 text-muted">{formatDate(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                          <button onClick={() => openDetail(r)} className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-accent/10 hover:text-accent" aria-label="Détails">
                            <FiEye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState icon={FiRotateCcw} title="Aucune demande de retour" subtitle={q || statusFilter ? 'Aucun résultat pour ce filtre.' : 'Les demandes de retour apparaîtront ici.'} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Détail + traitement */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Retour ${detail?.reference || ''}`} size="md">
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={meta(detail.status).tone}>{meta(detail.status).label}</StatusBadge>
              <span className="font-mono text-xs text-muted">Commande {detail.order?.reference}</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-surface p-4 text-sm dark:bg-primary-800">
                <p className="mb-1 font-semibold dark:text-white">Client</p>
                <p className="text-muted">{detail.user?.name}</p>
                <p className="text-muted">{detail.user?.email}</p>
                {detail.user?.phone && <p className="text-muted">{detail.user.phone}</p>}
              </div>
              <div className="rounded-xl bg-surface p-4 text-sm dark:bg-primary-800">
                <p className="mb-1 font-semibold dark:text-white">Remboursement</p>
                <p className="text-xl font-bold text-accent">{formatPrice(detail.refundAmount)}</p>
                <p className="text-xs text-muted">Demandé le {formatDate(detail.createdAt)}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 font-semibold dark:text-white">Articles retournés</p>
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

            <div className="rounded-xl bg-surface p-4 text-sm dark:bg-primary-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Motif du client</p>
              <p className="mt-0.5 dark:text-white/90">{detail.reason}</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold dark:text-white">Note interne (motif de refus, suivi…)</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Visible par le client en cas de refus."
                className="input resize-none"
              />
            </div>

            {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

            {/* Actions selon le statut courant */}
            <div className="flex flex-wrap justify-end gap-3">
              {detail.status === 'requested' && (
                <>
                  <button onClick={() => updateStatus('rejected')} disabled={busy} className="btn-outline text-danger">
                    <FiXCircle /> Refuser
                  </button>
                  <button onClick={() => updateStatus('approved')} disabled={busy} className="btn-primary">
                    <FiCheckCircle /> Approuver
                  </button>
                </>
              )}
              {detail.status === 'approved' && (
                <button onClick={() => updateStatus('refunded')} disabled={busy} className="btn-buy">
                  <FiDollarSign /> Marquer remboursé
                </button>
              )}
              {(detail.status === 'rejected' || detail.status === 'refunded') && (
                <button onClick={() => setDetail(null)} className="btn-outline">Fermer</button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
