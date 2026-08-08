import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import Modal from '@/components/ui/Modal';
import { productService } from '@/services/product.service';
import { adminService } from '@/services/admin.service';
import { formatPrice } from '@/utils/format';
import { POS_PAYMENT_METHODS } from '@/constants';

const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Création d'une commande « sur place » (vente au comptoir). */
export default function NewOrderModal({ open, onClose, onCreated }) {
  const [q, setQ] = useState('');
  const [lines, setLines] = useState({}); // { productId: { product, qty } }
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [method, setMethod] = useState('cash');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const { data } = useQuery({ queryKey: ['pos-products'], queryFn: () => productService.list({ limit: 100 }), enabled: open });
  const products = data?.data || [];

  const results = useMemo(() => {
    const t = norm(q.trim());
    return (t ? products.filter((p) => norm(p.name).includes(t)) : products).slice(0, 8);
  }, [products, q]);

  const items = Object.values(lines);
  const total = items.reduce((s, it) => s + it.product.price * it.qty, 0);

  const add = (p) => setLines((l) => ({ ...l, [p.id]: { product: p, qty: (l[p.id]?.qty || 0) + 1 } }));
  const setQty = (id, qty) =>
    setLines((l) => {
      if (qty <= 0) { const n = { ...l }; delete n[id]; return n; }
      return { ...l, [id]: { ...l[id], qty } };
    });

  async function submit() {
    if (!items.length) return setError('Ajoutez au moins un article.');
    setBusy(true);
    setError('');
    try {
      await adminService.createOrder({
        customer: { name: customer.name.trim(), phone: customer.phone.trim() },
        items: items.map((it) => ({ productId: it.product.id, quantity: it.qty })),
        paymentMethod: method,
        status: 'paid',
      });
      setLines({}); setCustomer({ name: '', phone: '' }); setQ(''); setMethod('cash');
      onCreated?.();
    } catch (e) {
      setError(e.response?.data?.message || 'Création impossible.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle commande — vente sur place" size="lg">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Produits */}
        <div>
          <label className="label dark:text-white/80">Ajouter des produits</label>
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input className="input pl-9" placeholder="Rechercher un produit…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="mt-2 max-h-56 space-y-1 overflow-y-auto pr-1">
            {results.map((p) => (
              <button key={p.id} type="button" onClick={() => add(p)} className="flex w-full items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-left text-sm transition hover:border-accent dark:border-white/10">
                <span className="min-w-0 truncate dark:text-white">{p.name}</span>
                <span className="shrink-0 font-semibold text-accent">{formatPrice(p.price)}</span>
              </button>
            ))}
            {!results.length && <p className="px-1 py-2 text-sm text-muted">Aucun produit.</p>}
          </div>
        </div>

        {/* Panier + client + paiement */}
        <div className="space-y-4">
          <div>
            <label className="label dark:text-white/80">Articles</label>
            {items.length ? (
              <div className="divide-y divide-line rounded-xl ring-1 ring-line dark:divide-white/10 dark:ring-white/10">
                {items.map((it) => (
                  <div key={it.product.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                    <span className="min-w-0 flex-1 truncate dark:text-white">{it.product.name}</span>
                    <div className="inline-flex shrink-0 items-center rounded-full border border-line dark:border-white/15">
                      <button type="button" onClick={() => setQty(it.product.id, it.qty - 1)} className="grid h-7 w-7 place-items-center text-muted"><FiMinus size={12} /></button>
                      <span className="w-6 text-center dark:text-white">{it.qty}</span>
                      <button type="button" onClick={() => setQty(it.product.id, it.qty + 1)} className="grid h-7 w-7 place-items-center text-muted"><FiPlus size={12} /></button>
                    </div>
                    <span className="w-20 shrink-0 text-right font-semibold dark:text-white">{formatPrice(it.product.price * it.qty)}</span>
                    <button type="button" onClick={() => setQty(it.product.id, 0)} className="grid h-7 w-7 shrink-0 place-items-center rounded text-muted hover:text-danger"><FiTrash2 size={13} /></button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted dark:border-white/10">Aucun article ajouté</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Nom du client (optionnel)" value={customer.name} onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))} />
            <input className="input" placeholder="Téléphone (optionnel)" value={customer.phone} onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))} />
          </div>

          <div>
            <label className="label dark:text-white/80">Paiement</label>
            <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
              {POS_PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between border-t border-line pt-3 dark:border-white/10">
            <span className="text-sm text-muted">Total</span>
            <span className="text-xl font-extrabold dark:text-white">{formatPrice(total)}</span>
          </div>

          {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <button type="button" onClick={submit} disabled={busy} className="btn-primary w-full">
            <FiShoppingBag /> {busy ? 'Création…' : 'Créer la commande'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
