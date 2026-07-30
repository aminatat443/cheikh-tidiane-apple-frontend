import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiUploadCloud, FiImage } from 'react-icons/fi';
import Loader from '@/components/ui/Loader';
import ProductMedia from '@/components/product/ProductMedia';
import { adminService } from '@/services/admin.service';
import { productService } from '@/services/product.service';
import { formatPrice } from '@/utils/format';

export default function Admin() {
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const { data: dash } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminService.dashboard(),
  });
  const { data: prods, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => productService.list({ limit: 60 }),
  });

  const stats = dash?.data || {};
  const cards = [
    { label: 'Produits', value: stats.productsCount },
    { label: 'Clients', value: stats.clientsCount },
    { label: 'Commandes', value: stats.ordersCount },
    { label: 'Contrats Lebalma', value: stats.contractsCount },
    { label: "Chiffre d'affaires", value: formatPrice(stats.revenue || 0) },
  ];

  async function handleFiles(product, fileList) {
    const files = Array.from(fileList).slice(0, 4);
    if (!files.length) return;
    setBusyId(product.id);
    setError('');
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('images', f));
      const up = await adminService.uploadImages(fd);
      await adminService.updateProduct(product.id, { images: up.data });
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product'] });
    } catch (e) {
      setError(e.response?.data?.message || 'Échec du téléversement');
    } finally {
      setBusyId(null);
    }
  }

  const products = prods?.data || [];

  return (
    <div className="container-page py-8">
      <p className="eyebrow mb-1">Administration</p>
      <h1 className="text-3xl font-extrabold tracking-tighter dark:text-white">Tableau de bord</h1>

      {/* Statistiques */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-6">
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-2 text-2xl font-extrabold dark:text-white">{c.value ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Gestion des photos produits */}
      <div className="mt-12">
        <h2 className="text-xl font-bold dark:text-white">Photos des produits</h2>
        <p className="mt-1 text-sm text-muted">
          Sélectionnez jusqu'à 4 images par produit. Le téléversement remplace les photos existantes.
        </p>
        {error && (
          <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        )}

        {isLoading ? (
          <Loader />
        ) : (
          <div className="mt-5 space-y-3">
            {products.map((p) => {
              const imgs = Array.isArray(p.images) ? p.images.slice(0, 4) : [];
              const busy = busyId === p.id;
              return (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-line dark:bg-primary-800 dark:ring-white/10"
                >
                  {/* Miniature principale */}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface dark:bg-primary-900">
                    {imgs[0] ? (
                      <img src={imgs[0]} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <ProductMedia product={p} className="h-full w-full" />
                    )}
                  </div>

                  {/* Infos */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold dark:text-white">{p.name}</p>
                    <p className="text-sm text-muted">{formatPrice(p.price)}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {imgs.length ? `${imgs.length} photo(s)` : 'Aucune photo — illustration par défaut'}
                    </p>
                  </div>

                  {/* Aperçu des photos existantes */}
                  {imgs.length > 0 && (
                    <div className="flex gap-1.5">
                      {imgs.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover ring-1 ring-line dark:ring-white/10"
                        />
                      ))}
                    </div>
                  )}

                  {/* Bouton upload */}
                  <label
                    className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      busy
                        ? 'cursor-not-allowed bg-primary-100 text-muted dark:bg-white/10'
                        : 'bg-accent text-white hover:bg-accent-hover'
                    }`}
                  >
                    {busy ? (
                      'Téléversement…'
                    ) : (
                      <>
                        <FiUploadCloud size={16} /> {imgs.length ? 'Remplacer' : 'Ajouter des photos'}
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={busy}
                      className="hidden"
                      onChange={(e) => {
                        handleFiles(p, e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modules à venir */}
      <p className="mt-10 flex items-center gap-2 rounded-xl bg-surface p-4 text-sm text-muted dark:bg-primary-800">
        <FiImage size={16} /> Prochaines évolutions admin : création/édition produits, gestion des
        commandes et des contrats Lebalma.
      </p>
    </div>
  );
}
