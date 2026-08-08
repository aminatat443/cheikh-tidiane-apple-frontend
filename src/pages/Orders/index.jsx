import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiRotateCcw, FiPackage } from 'react-icons/fi';
import Loader from '@/components/ui/Loader';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import OrderTracker from '@/components/order/OrderTracker';
import { orderService } from '@/services/auth.service';
import { returnService } from '@/services/return.service';
import { formatPrice, formatDate, cn } from '@/utils/format';
import { ORDER_STATUSES, RETURNABLE_ORDER_STATUS } from '@/constants';

const meta = (v) => ORDER_STATUSES.find((s) => s.value === v) || { label: v, tone: 'muted' };

export default function Orders() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['orders'], queryFn: () => orderService.list() });
  const orders = data?.data || [];

  const [returnOrder, setReturnOrder] = useState(null);

  if (isLoading) return <Loader />;

  if (!orders.length) {
    return (
      <div className="container-page py-20 text-center">
        <FiPackage className="mx-auto text-muted" size={32} />
        <h1 className="mt-3 text-2xl font-extrabold dark:text-white">Aucune commande</h1>
        <p className="mt-1 text-sm text-muted">Vous n’avez pas encore passé de commande.</p>
        <Link to="/products" className="btn-primary mt-6 inline-flex">Découvrir nos produits</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight dark:text-white">Mes commandes</h1>
        <Link to="/returns" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
          <FiRotateCcw size={15} /> Mes retours
        </Link>
      </div>

      <div className="space-y-4">
        {orders.map((o) => {
          const st = meta(o.status);
          const returnable = RETURNABLE_ORDER_STATUS.includes(o.status);
          return (
            <div key={o.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold dark:text-white">#{o.reference}</p>
                  <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
                </div>
                <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                <p className="font-bold text-accent">{formatPrice(o.total)}</p>
              </div>

              {(o.items?.length > 0) && (
                <div className="mt-3 space-y-1 border-t border-line pt-3 text-sm dark:border-white/10">
                  {o.items.map((it) => (
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
              )}

              {/* Suivi de commande (style Jumia) */}
              <div className="mt-4 border-t border-line pt-4 dark:border-white/10">
                <p className="mb-4 text-xs font-bold uppercase tracking-wide text-muted">Suivi de la commande</p>
                <OrderTracker status={o.status} />
              </div>

              {returnable && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => setReturnOrder(o)}
                    className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-primary transition hover:border-accent hover:text-accent dark:border-white/15 dark:text-white/80"
                  >
                    <FiRotateCcw size={15} /> Demander un retour
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ReturnModal
        order={returnOrder}
        onClose={() => setReturnOrder(null)}
        onDone={() => {
          qc.invalidateQueries({ queryKey: ['orders'] });
          qc.invalidateQueries({ queryKey: ['my-returns'] });
          qc.invalidateQueries({ queryKey: ['notifications'] });
          setReturnOrder(null);
        }}
      />
    </div>
  );
}

/** Modale de demande de retour : sélection des articles + quantité + motif. */
function ReturnModal({ order, onClose, onDone }) {
  const [selected, setSelected] = useState({}); // { orderItemId: quantity }
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Réinitialise à l'ouverture d'une nouvelle commande
  const orderId = order?.id;
  const items = order?.items || [];

  useEffect(() => {
    setSelected({});
    setReason('');
    setError('');
  }, [orderId]);

  const toggle = (it) =>
    setSelected((s) => {
      const next = { ...s };
      if (next[it.id]) delete next[it.id];
      else next[it.id] = it.quantity;
      return next;
    });

  const setQty = (it, qty) =>
    setSelected((s) => ({ ...s, [it.id]: Math.min(Math.max(Number(qty) || 1, 1), it.quantity) }));

  const chosen = items.filter((it) => selected[it.id]);
  const refundEstimate = chosen.reduce((sum, it) => sum + it.unitPrice * selected[it.id], 0);

  async function submit() {
    if (!chosen.length) {
      setError('Sélectionnez au moins un article à retourner');
      return;
    }
    if (!reason.trim()) {
      setError('Veuillez indiquer le motif du retour');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await returnService.create({
        orderId,
        reason: reason.trim(),
        items: chosen.map((it) => ({ orderItemId: it.id, quantity: selected[it.id] })),
      });
      onDone();
    } catch (e) {
      setError(e.response?.data?.message || 'Impossible d’enregistrer la demande pour le moment');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={!!order} onClose={onClose} title={`Retour — commande ${order?.reference || ''}`} size="md">
      {order && (
        <div className="space-y-5">
          <p className="text-sm text-muted">
            Sélectionnez les articles à retourner et précisez le motif. Vous serez remboursé après validation par la boutique.
          </p>

          <div className="divide-y divide-line rounded-xl ring-1 ring-line dark:divide-white/10 dark:ring-white/10">
            {items.map((it) => {
              const isSel = !!selected[it.id];
              return (
                <div key={it.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                  <label className="flex flex-1 cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() => toggle(it)}
                      className="h-4 w-4 accent-accent"
                    />
                    <span className="dark:text-white">
                      {it.productName}
                      {(it.storage || it.color) && (
                        <span className="text-muted"> — {[it.storage, it.color].filter(Boolean).join(' · ')}</span>
                      )}
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    {it.quantity > 1 && (
                      <label className="flex items-center gap-1.5 text-xs text-muted">
                        Qté
                        <input
                          type="number"
                          min={1}
                          max={it.quantity}
                          value={selected[it.id] || it.quantity}
                          disabled={!isSel}
                          onChange={(e) => setQty(it, e.target.value)}
                          className="w-16 rounded-lg border border-line bg-white px-2 py-1 text-sm disabled:opacity-40 dark:border-white/15 dark:bg-primary-800 dark:text-white"
                        />
                        <span className="text-muted/70">/ {it.quantity}</span>
                      </label>
                    )}
                    <span className="font-semibold dark:text-white">{formatPrice(it.unitPrice)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold dark:text-white">Motif du retour</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex. : produit défectueux, ne correspond pas à la description…"
              className="input resize-none"
            />
          </div>

          <div className={cn('flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm dark:bg-primary-800',
            !chosen.length && 'opacity-60')}>
            <span className="text-muted">Montant remboursable estimé</span>
            <span className="font-bold text-accent">{formatPrice(refundEstimate)}</span>
          </div>

          {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="btn-outline">Annuler</button>
            <button onClick={submit} disabled={busy} className="btn-primary">
              {busy ? 'Envoi…' : 'Envoyer la demande'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
