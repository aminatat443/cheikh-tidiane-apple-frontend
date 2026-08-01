import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FiEye, FiCheck, FiTruck, FiCheckCircle, FiAlertTriangle, FiPlus, FiClock as FiHourglass, FiCreditCard,
} from 'react-icons/fi';
import Loader from '@/components/ui/Loader';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import TableSkeleton from '@/components/ui/TableSkeleton';
import ContractForm from './ContractForm';
import { adminService } from '@/services/admin.service';
import { formatPrice, formatDate } from '@/utils/format';
import { CONTRACT_STATUSES, INSTALLMENT_STATUSES } from '@/constants';

const cMeta = (v) => CONTRACT_STATUSES.find((s) => s.value === v) || { label: v, tone: 'muted' };
const paidCount = (c) => (c.installments || []).filter((i) => i.status === 'paid').length;

export default function Lebalma() {
  const qc = useQueryClient();
  const [detailId, setDetailId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['admin', 'contracts'], queryFn: () => adminService.contracts() });
  const { data: detailData } = useQuery({
    queryKey: ['admin', 'contract', detailId],
    queryFn: () => adminService.contract(detailId),
    enabled: !!detailId,
  });

  const contracts = data?.data || [];
  const contract = detailData?.data;

  // Statistiques des échéances (retard / en attente de validation / payées)
  const instStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let late = 0;
    let pending = 0;
    let paid = 0;
    contracts.forEach((c) =>
      (c.installments || []).forEach((i) => {
        if (i.status === 'paid') paid += 1;
        else if (i.status === 'pending') pending += 1;
        else if (i.status === 'late' || (i.status === 'upcoming' && new Date(i.dueDate) < today)) late += 1;
      })
    );
    return { late, pending, paid };
  }, [contracts]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'contracts'] });
    qc.invalidateQueries({ queryKey: ['admin', 'contract', detailId] });
    qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
  };

  async function run(fn) {
    setBusy(true);
    try { await fn(); refresh(); } finally { setBusy(false); }
  }

  return (
    <div>
      <PageHeader title="Contrats Lebalma" subtitle={`${contracts.length} contrat(s) de financement.`}>
        <button onClick={() => setCreateOpen(true)} className="btn-primary">
          <FiPlus /> Nouveau contrat (client en boutique)
        </button>
      </PageHeader>

      {/* Cartes échéances (retard / en attente de validation / payées) */}
      <div className="stagger-in mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={FiAlertTriangle} tone="danger" label="Échéances en retard" value={instStats.late} />
        <StatCard icon={FiHourglass} tone="warning" label="En attente de validation" value={instStats.pending} sub="Virements / espèces à confirmer" />
        <StatCard icon={FiCheckCircle} tone="success" label="Échéances payées" value={instStats.paid} />
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
                  <th className="px-4 py-3 font-semibold">Produit</th>
                  <th className="px-4 py-3 font-semibold">Acompte</th>
                  <th className="px-4 py-3 font-semibold">Échéances</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-white/10">
                {contracts.map((c) => {
                  const st = cMeta(c.status);
                  const paid = paidCount(c);
                  return (
                    <tr key={c.id} className="group">
                      <td className="px-4 py-3 font-mono text-xs font-semibold dark:text-white">{c.reference}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium dark:text-white">{c.user?.name || '—'}</p>
                        <p className="text-xs text-muted">{c.user?.phone || c.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-muted">{c.product?.name || '—'}</td>
                      <td className="px-4 py-3 dark:text-white">{formatPrice(c.downPaymentAmount)}<span className="text-xs text-muted"> ({c.downPaymentPercent}%)</span></td>
                      <td className="px-4 py-3">
                        <span className="font-medium dark:text-white">{paid}/{c.installmentsCount}</span>
                        <span className="text-xs text-muted"> × {formatPrice(c.installmentAmount)}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge tone={st.tone}>{st.label}</StatusBadge></td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setDetailId(c.id)} className="ml-auto grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-accent/10 hover:text-accent" aria-label="Détails">
                          <FiEye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {contracts.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState icon={FiCreditCard} title="Aucun contrat Lebalma" subtitle="Générez un contrat pour un client en boutique." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Nouveau contrat en boutique */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Générer un contrat Lebalma" size="md">
        {createOpen && (
          <ContractForm
            onClose={() => setCreateOpen(false)}
            onSaved={() => { setCreateOpen(false); refresh(); }}
          />
        )}
      </Modal>

      {/* Détail contrat */}
      <Modal open={!!detailId} onClose={() => setDetailId(null)} title={`Contrat ${contract?.reference || ''}`} size="lg">
        {!contract ? (
          <Loader />
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-surface p-4 text-sm dark:bg-primary-800">
                <p className="mb-1 font-semibold dark:text-white">Client</p>
                <p className="text-muted">{contract.user?.name}</p>
                <p className="text-muted">{contract.user?.phone || contract.user?.email}</p>
              </div>
              <div className="rounded-xl bg-surface p-4 text-sm dark:bg-primary-800">
                <p className="mb-1 font-semibold dark:text-white">Produit</p>
                <p className="text-muted">{contract.product?.name}</p>
                <p className="text-muted">Prix : {formatPrice(contract.productPrice)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Acompte', `${formatPrice(contract.downPaymentAmount)} (${contract.downPaymentPercent}%)`],
                ['Financé', formatPrice(contract.financedAmount)],
                ['Mensualité', formatPrice(contract.installmentAmount)],
                ['Total', formatPrice(contract.totalAmount)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl ring-1 ring-line p-3 dark:ring-white/10">
                  <p className="text-xs text-muted">{k}</p>
                  <p className="mt-0.5 font-bold dark:text-white">{v}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium dark:text-white/80">Statut :</span>
              <select
                value={contract.status}
                disabled={busy}
                onChange={(e) => run(() => adminService.updateContractStatus(contract.id, e.target.value))}
                className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm dark:border-white/15 dark:bg-primary-800 dark:text-white"
              >
                {CONTRACT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              {contract.deviceDeliveredAt ? (
                <StatusBadge tone="success"><FiTruck size={12} /> Remis le {formatDate(contract.deviceDeliveredAt)}</StatusBadge>
              ) : (
                <button disabled={busy} onClick={() => run(() => adminService.deliverContract(contract.id))} className="btn-outline px-4 py-2 text-sm">
                  <FiTruck size={15} /> Marquer l'appareil comme remis
                </button>
              )}
            </div>

            <div>
              <p className="mb-2 font-semibold dark:text-white">Échéancier</p>
              <div className="overflow-hidden rounded-xl ring-1 ring-line dark:ring-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted dark:bg-primary-800">
                    <tr>
                      <th className="px-3 py-2 font-semibold">N°</th>
                      <th className="px-3 py-2 font-semibold">Échéance</th>
                      <th className="px-3 py-2 font-semibold">Montant</th>
                      <th className="px-3 py-2 font-semibold">Statut</th>
                      <th className="px-3 py-2 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line dark:divide-white/10">
                    {(contract.installments || []).slice().sort((a, b) => a.sequence - b.sequence).map((inst) => {
                      const im = INSTALLMENT_STATUSES[inst.status] || { label: inst.status, tone: 'muted' };
                      return (
                        <tr key={inst.id}>
                          <td className="px-3 py-2 dark:text-white">{inst.sequence}</td>
                          <td className="px-3 py-2 text-muted">{formatDate(inst.dueDate)}</td>
                          <td className="px-3 py-2 font-semibold dark:text-white">{formatPrice(inst.amount)}</td>
                          <td className="px-3 py-2"><StatusBadge tone={im.tone}>{im.label}</StatusBadge></td>
                          <td className="px-3 py-2 text-right">
                            {inst.status !== 'paid' && (
                              <button disabled={busy} onClick={() => run(() => adminService.payInstallment(inst.id))} className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-2.5 py-1 text-xs font-semibold text-success transition hover:bg-success/20">
                                <FiCheck size={13} /> Payée
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
