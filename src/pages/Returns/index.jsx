import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiRotateCcw } from 'react-icons/fi';
import Loader from '@/components/ui/Loader';
import StatusBadge from '@/components/ui/StatusBadge';
import { returnService } from '@/services/return.service';
import { formatPrice, formatDate } from '@/utils/format';
import { RETURN_STATUSES } from '@/constants';

const meta = (v) => RETURN_STATUSES.find((s) => s.value === v) || { label: v, tone: 'muted' };

export default function Returns() {
  const { data, isLoading } = useQuery({ queryKey: ['my-returns'], queryFn: () => returnService.list() });

  if (isLoading) return <Loader />;
  const returns = data?.data || [];

  return (
    <div className="container-page py-8">
      <p className="eyebrow mb-1">Espace client</p>
      <h1 className="text-3xl font-extrabold tracking-tighter dark:text-white">Mes retours</h1>
      <p className="mt-1 text-sm text-muted">Suivez l’état de vos demandes de retour et de remboursement.</p>

      {returns.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <FiRotateCcw className="mx-auto text-muted" size={32} />
          <p className="mt-3 font-semibold dark:text-white">Aucune demande de retour</p>
          <p className="mt-1 text-sm text-muted">
            Vous pouvez demander un retour depuis le détail d’une commande éligible.
          </p>
          <Link to="/orders" className="btn-primary mt-6 inline-flex">Voir mes commandes</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {returns.map((r) => {
            const st = meta(r.status);
            return (
              <div key={r.id} className="card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5 dark:border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-semibold dark:text-white">{r.reference}</p>
                      <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      Commande {r.order?.reference || '—'} · {formatDate(r.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted">Montant remboursable</p>
                    <p className="text-lg font-bold text-accent">{formatPrice(r.refundAmount)}</p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="space-y-1 text-sm">
                    {(r.items || []).map((it) => (
                      <div key={it.id} className="flex items-center justify-between">
                        <span className="text-muted">
                          {it.productName}
                          {(it.storage || it.color) && (
                            <span className="text-muted/80"> — {[it.storage, it.color].filter(Boolean).join(' · ')}</span>
                          )}
                          <span className="text-muted/80"> × {it.quantity}</span>
                        </span>
                        <span className="font-medium dark:text-white">{formatPrice(it.unitPrice * it.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-xl bg-surface p-3 text-sm dark:bg-primary-800">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Motif</p>
                    <p className="mt-0.5 dark:text-white/90">{r.reason}</p>
                  </div>

                  {r.status === 'rejected' && r.adminNote && (
                    <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                      Refusé : {r.adminNote}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
