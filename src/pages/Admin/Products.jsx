import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiPackage, FiStar, FiZap, FiTag } from 'react-icons/fi';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import TableSkeleton from '@/components/ui/TableSkeleton';
import ProductMedia from '@/components/product/ProductMedia';
import ProductForm from './ProductForm';
import { adminService } from '@/services/admin.service';
import { productService, categoryService } from '@/services/product.service';
import { formatPrice, cn } from '@/utils/format';

// Pastille bascule (mise en avant rapide : à la une / nouveauté / promo).
function ToggleChip({ active, onClick, disabled, icon: Icon, label, tone = 'accent' }) {
  const on = {
    accent: 'bg-accent text-white',
    warning: 'bg-warning text-white',
    danger: 'bg-danger text-white',
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'grid h-8 w-8 place-items-center rounded-lg text-sm transition disabled:opacity-50',
        active ? on : 'bg-surface text-muted hover:text-primary dark:bg-white/5 dark:hover:text-white'
      )}
    >
      <Icon size={15} />
    </button>
  );
}

export default function Products() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null); // { product } | { product: null } (create)
  const [deleting, setDeleting] = useState(null);
  const [busyFlag, setBusyFlag] = useState(null);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => productService.list({ limit: 200 }),
  });
  const { data: cats } = useQuery({ queryKey: ['categories'], queryFn: () => categoryService.list() });

  const products = data?.data || [];
  const categories = cats?.data || [];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => `${p.name} ${p.model || ''}`.toLowerCase().includes(term));
  }, [products, q]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'products'] });
    qc.invalidateQueries({ queryKey: ['products'] });
    qc.invalidateQueries({ queryKey: ['product'] });
  };

  // Mise en avant rapide : bascule isFeatured / isNew / isPromo en un clic.
  async function toggleFlag(p, key) {
    setBusyFlag(`${p.id}:${key}`);
    setError('');
    try {
      await adminService.updateProduct(p.id, { [key]: !p[key] });
      refresh();
    } catch (e) {
      setError(e.response?.data?.message || 'Mise à jour impossible');
    } finally {
      setBusyFlag(null);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setError('');
    try {
      await adminService.deleteProduct(deleting.id);
      setDeleting(null);
      refresh();
    } catch (e) {
      setError(e.response?.data?.message || 'Suppression impossible');
    }
  }

  return (
    <div>
      <PageHeader title="Produits" subtitle={`${products.length} produit(s) au catalogue.`}>
        <button onClick={() => setModal({ product: null })} className="btn-primary">
          <FiPlus /> Nouveau produit
        </button>
      </PageHeader>

      <div className="relative mt-5 max-w-sm">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
        <input className="input pl-9" placeholder="Rechercher un produit…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {error && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {isLoading ? (
        <TableSkeleton cols={6} />
      ) : (
        <div className="card mt-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted dark:bg-primary-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Produit</th>
                  <th className="px-4 py-3 font-semibold">Catégorie</th>
                  <th className="px-4 py-3 font-semibold">Prix</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">État</th>
                  <th className="px-4 py-3 font-semibold">Mise en avant</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-white/10">
                {filtered.map((p) => (
                  <tr key={p.id} className="group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface dark:bg-primary-900">
                          <ProductMedia product={p} className="h-full w-full" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold dark:text-white">{p.name}</p>
                          <p className="truncate text-xs text-muted">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{p.category?.name || '—'}</td>
                    <td className="px-4 py-3 font-semibold dark:text-white">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={p.stock === 0 ? 'danger' : p.stock <= 3 ? 'warning' : 'success'}>
                        {p.stock}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={p.newAvailable ? 'accent' : 'muted'}>
                        {p.newAvailable ? 'Neuf & reconditionné' : 'Reconditionné'}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <ToggleChip active={p.isFeatured} disabled={busyFlag === `${p.id}:isFeatured`} onClick={() => toggleFlag(p, 'isFeatured')} icon={FiStar} label="À la une" tone="accent" />
                        <ToggleChip active={p.isNew} disabled={busyFlag === `${p.id}:isNew`} onClick={() => toggleFlag(p, 'isNew')} icon={FiZap} label="Nouvel arrivage" tone="warning" />
                        <ToggleChip active={p.isPromo} disabled={busyFlag === `${p.id}:isPromo`} onClick={() => toggleFlag(p, 'isPromo')} icon={FiTag} label="En promo" tone="danger" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        <button onClick={() => setModal({ product: p })} className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-accent/10 hover:text-accent" aria-label="Modifier">
                          <FiEdit2 size={16} />
                        </button>
                        <button onClick={() => setDeleting(p)} className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-danger/10 hover:text-danger" aria-label="Supprimer">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        icon={FiPackage}
                        title="Aucun produit trouvé"
                        subtitle={q ? 'Essayez un autre terme de recherche.' : 'Ajoutez votre premier produit au catalogue.'}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal création / édition */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.product ? 'Modifier le produit' : 'Nouveau produit'}
        size="lg"
      >
        {modal && (
          <ProductForm
            product={modal.product}
            categories={categories}
            onClose={() => setModal(null)}
            onSaved={() => { setModal(null); refresh(); }}
          />
        )}
      </Modal>

      {/* Confirmation suppression */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Supprimer le produit" size="sm">
        <p className="text-sm text-muted">
          Confirmez-vous la suppression de <strong className="text-primary dark:text-white">{deleting?.name}</strong> ?
          Cette action est irréversible.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setDeleting(null)} className="btn-outline">Annuler</button>
          <button onClick={confirmDelete} className="btn bg-danger text-white hover:bg-danger/90">Supprimer</button>
        </div>
      </Modal>
    </div>
  );
}
