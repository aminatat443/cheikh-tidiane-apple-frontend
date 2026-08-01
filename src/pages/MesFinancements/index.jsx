import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiCreditCard, FiCheck, FiClock, FiChevronRight } from 'react-icons/fi';
import Loader from '@/components/ui/Loader';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import { lebalmaService } from '@/services/product.service';
import { paymentService } from '@/services/payment.service';
import { formatPrice, formatDate, cn } from '@/utils/format';
import { INSTALLMENT_STATUSES, CONTRACT_STATUSES, LEBALMA_PAY_METHODS } from '@/constants';

// Moyens réglés en ligne via la passerelle (redirection) vs validation manuelle.
const GATEWAY_METHODS = ['wave', 'orange_money'];

const cMeta = (v) => CONTRACT_STATUSES.find((s) => s.value === v) || { label: v, tone: 'muted' };

export default function MesFinancements() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['my-contracts'], queryFn: () => lebalmaService.myContracts() });
  const contracts = data?.data || [];

  // Les contrats actifs d'abord, puis en attente / défaut / terminé / annulé.
  const sortedContracts = useMemo(() => {
    const rank = { active: 0, pending: 1, defaulted: 2, completed: 3, cancelled: 4 };
    return [...contracts].sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9));
  }, [contracts]);

  // Prochaine échéance à régler (la plus proche, hors contrats soldés/annulés).
  const nextDue = useMemo(() => {
    let best = null;
    for (const c of contracts) {
      if (c.status === 'completed' || c.status === 'cancelled') continue;
      for (const inst of c.installments || []) {
        if (inst.status === 'paid') continue;
        if (!best || new Date(inst.dueDate) < new Date(best.installment.dueDate)) {
          best = { installment: inst, contract: c };
        }
      }
    }
    return best;
  }, [contracts]);

  const [payTarget, setPayTarget] = useState(null); // { installment, contract }
  const [method, setMethod] = useState('wave');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  async function confirmPay() {
    if (!payTarget) return;
    setPaying(true);
    setError('');
    try {
      // Wave / Orange Money → passerelle en ligne (redirection, confirmation par webhook).
      if (GATEWAY_METHODS.includes(method)) {
        const pay = await paymentService.initiate({
          purpose: 'installment',
          referenceId: payTarget.installment.id,
          method,
        });
        window.location.href = pay.data.checkoutUrl;
        return;
      }
      // Virement / espèces → enregistrement « en attente de validation » (manuel).
      await lebalmaService.payInstallment(payTarget.installment.id, method);
      qc.invalidateQueries({ queryKey: ['my-contracts'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      setPayTarget(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Paiement impossible pour le moment');
    } finally {
      setPaying(false);
    }
  }

  if (isLoading) return <Loader />;

  return (
    <div className="container-page py-8">
      <p className="eyebrow mb-1">Espace client</p>
      <h1 className="text-3xl font-extrabold tracking-tighter dark:text-white">Mes Lebalma</h1>
      <p className="mt-1 text-sm text-muted">Suivez vos contrats, vos échéances et réglez en ligne.</p>

      {/* Alerte prochaine échéance */}
      {nextDue && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-warning/20 text-warning">
              <FiClock size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-primary dark:text-white">Prochaine échéance à régler</p>
              <p className="text-sm text-muted">
                {formatPrice(nextDue.installment.amount)} — le {formatDate(nextDue.installment.dueDate)}
                {nextDue.contract.product?.name ? ` · ${nextDue.contract.product.name}` : ''}
              </p>
            </div>
          </div>
          {nextDue.installment.status !== 'pending' && (
            <button
              onClick={() => { setPayTarget(nextDue); setMethod('wave'); }}
              className="btn-buy px-4 py-2 text-sm"
            >
              Payer maintenant <FiChevronRight size={14} />
            </button>
          )}
        </div>
      )}

      {contracts.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <FiCreditCard className="mx-auto text-muted" size={32} />
          <p className="mt-3 font-semibold dark:text-white">Aucun financement en cours</p>
          <p className="mt-1 text-sm text-muted">
            Rendez-vous en boutique ou souscrivez à Lebalma depuis une fiche produit éligible.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {sortedContracts.map((c) => {
            const insts = (c.installments || []).slice().sort((a, b) => a.sequence - b.sequence);
            const paid = insts.filter((i) => i.status === 'paid').length;
            const pct = insts.length ? Math.round((paid / insts.length) * 100) : 0;
            const st = cMeta(c.status);
            return (
              <div key={c.id} className="card overflow-hidden">
                {/* Entête contrat */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5 dark:border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold dark:text-white">{c.product?.name || 'Produit'}</h2>
                      <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-muted">{c.reference}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted">Mensualité</p>
                    <p className="text-lg font-bold text-accent">{formatPrice(c.installmentAmount)}</p>
                  </div>
                </div>

                {/* Résumé + progression */}
                <div className="grid gap-4 p-5 sm:grid-cols-4">
                  {[
                    ['Acompte', `${formatPrice(c.downPaymentAmount)} (${c.downPaymentPercent}%)`],
                    ['Financé', formatPrice(c.financedAmount)],
                    ['Total', formatPrice(c.totalAmount)],
                    ['Payées', `${paid}/${insts.length}`],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-xs text-muted">{k}</p>
                      <p className="font-bold dark:text-white">{v}</p>
                    </div>
                  ))}
                  <div className="sm:col-span-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface dark:bg-primary-900">
                      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>

                {/* Échéancier */}
                <div className="border-t border-line dark:border-white/10">
                  {insts.map((inst) => {
                    const im = INSTALLMENT_STATUSES[inst.status] || { label: inst.status, tone: 'muted' };
                    const payable = inst.status !== 'paid' && inst.status !== 'pending';
                    return (
                      <div key={inst.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm odd:bg-surface/40 dark:odd:bg-white/5">
                        <div className="flex items-center gap-3">
                          <span className={cn('grid h-8 w-8 place-items-center rounded-full text-xs font-bold',
                            inst.status === 'paid' ? 'bg-success/10 text-success' : 'bg-surface text-muted dark:bg-primary-900')}>
                            {inst.status === 'paid' ? <FiCheck size={15} /> : inst.sequence}
                          </span>
                          <div>
                            <p className="font-semibold dark:text-white">Échéance n°{inst.sequence}</p>
                            <p className="text-xs text-muted">Échéance : {formatDate(inst.dueDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold dark:text-white">{formatPrice(inst.amount)}</span>
                          <StatusBadge tone={im.tone}>{im.label}</StatusBadge>
                          {payable && (
                            <button
                              onClick={() => { setPayTarget({ installment: inst, contract: c }); setMethod('wave'); }}
                              className="btn-buy px-4 py-2 text-sm"
                            >
                              Payer <FiChevronRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modale de paiement */}
      <Modal open={!!payTarget} onClose={() => setPayTarget(null)} title="Régler l'échéance" size="sm">
        {payTarget && (
          <div>
            <div className="rounded-xl bg-surface p-4 text-sm dark:bg-primary-800">
              <div className="flex justify-between"><span className="text-muted">Échéance</span><span className="font-semibold dark:text-white">n°{payTarget.installment.sequence}</span></div>
              <div className="mt-1 flex justify-between"><span className="text-muted">Montant</span><span className="font-bold text-accent">{formatPrice(payTarget.installment.amount)}</span></div>
            </div>

            <p className="mb-2 mt-5 text-sm font-semibold dark:text-white">Moyen de paiement</p>
            <div className="grid grid-cols-2 gap-2">
              {LEBALMA_PAY_METHODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMethod(m.value)}
                  className={cn('rounded-xl border px-4 py-3 text-sm font-medium transition',
                    method === m.value ? 'border-accent bg-accent-light text-accent dark:bg-white/5' : 'border-line text-primary-700 hover:border-primary dark:border-white/15 dark:text-white/80')}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <p className="mt-4 flex items-start gap-2 rounded-lg bg-surface px-3 py-2 text-xs text-muted dark:bg-primary-800">
              <FiClock className="mt-0.5 shrink-0" size={14} />
              {GATEWAY_METHODS.includes(method)
                ? 'Vous allez être redirigé vers la page de paiement sécurisée. La confirmation est automatique.'
                : 'Le paiement sera marqué « en attente de validation ». La boutique le confirme dès réception (le virement bancaire peut prendre quelques jours).'}
            </p>

            {error && <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setPayTarget(null)} className="btn-outline">Annuler</button>
              <button onClick={confirmPay} disabled={paying} className="btn-primary">
                {paying ? 'Envoi…' : GATEWAY_METHODS.includes(method) ? 'Continuer vers le paiement' : 'Confirmer le paiement'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
