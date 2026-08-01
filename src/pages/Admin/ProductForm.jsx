import { useState } from 'react';
import { FiPlus, FiTrash2, FiUploadCloud, FiX } from 'react-icons/fi';
import { adminService } from '@/services/admin.service';
import { cn } from '@/utils/format';

const slugify = (str) =>
  (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // supprime les accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const FLAGS = [
  { key: 'isNew', label: 'Nouveauté' },
  { key: 'isPromo', label: 'En promo' },
  { key: 'isFeatured', label: 'Mis en avant' },
  { key: 'isTopSale', label: 'Top vente' },
  { key: 'newAvailable', label: 'Version neuve dispo' },
];

export default function ProductForm({ product, categories = [], onClose, onSaved }) {
  const isEdit = Boolean(product?.id);
  const [f, setF] = useState(() => ({
    name: product?.name || '',
    slug: product?.slug || '',
    slugTouched: Boolean(product?.slug),
    categoryId: product?.categoryId || product?.category?.id || '',
    description: product?.description || '',
    price: product?.price ?? '',
    oldPrice: product?.oldPrice ?? '',
    stock: product?.stock ?? 0,
    model: product?.model || '',
    variants:
      Array.isArray(product?.variants) && product.variants.length
        ? product.variants.map((v) => ({ storage: v.storage || '', price: v.price ?? '' }))
        : [],
    colors:
      Array.isArray(product?.colors) && product.colors.length
        ? product.colors.map((c) => ({ name: c.name || c, hex: c.hex || '#111827' }))
        : [],
    images: Array.isArray(product?.images) ? product.images.filter(Boolean) : [],
    isNew: !!product?.isNew,
    isPromo: !!product?.isPromo,
    isFeatured: !!product?.isFeatured,
    isTopSale: !!product?.isTopSale,
    newAvailable: !!product?.newAvailable,
    lebalmaEligible: !!product?.lebalmaEligible,
    lebalmaFrequency: product?.lebalmaFrequency || 'monthly',
    lebalmaDownPercent: product?.lebalmaDownPercent ?? 40,
    lebalmaMonths: product?.lebalmaMonths ?? 3,
    lebalmaMultiplier: product?.lebalmaMultiplier ?? 1.6,
  }));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (patch) => setF((prev) => ({ ...prev, ...patch }));
  const onName = (name) => set({ name, slug: f.slugTouched ? f.slug : slugify(name) });

  // Variantes
  const addVariant = () => set({ variants: [...f.variants, { storage: '', price: '' }] });
  const updVariant = (i, patch) =>
    set({ variants: f.variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)) });
  const rmVariant = (i) => set({ variants: f.variants.filter((_, idx) => idx !== i) });

  // Couleurs
  const addColor = () => set({ colors: [...f.colors, { name: '', hex: '#111827' }] });
  const updColor = (i, patch) =>
    set({ colors: f.colors.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });
  const rmColor = (i) => set({ colors: f.colors.filter((_, idx) => idx !== i) });

  async function handleUpload(fileList) {
    const files = Array.from(fileList).slice(0, 6 - f.images.length);
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      files.forEach((file) => fd.append('images', file));
      const up = await adminService.uploadImages(fd);
      set({ images: [...f.images, ...(up.data || [])].slice(0, 6) });
    } catch (e) {
      setError(e.response?.data?.message || "Échec du téléversement d'image");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!f.name.trim()) return setError('Le nom est requis');
    if (f.price === '' || Number(f.price) < 0) return setError('Le prix (FCFA) est requis');

    const cleanVariants = f.variants
      .filter((v) => v.storage && v.price !== '')
      .map((v) => ({ storage: v.storage.trim(), price: Number(v.price) }));
    const cleanColors = f.colors
      .filter((c) => c.name.trim())
      .map((c) => ({ name: c.name.trim(), hex: c.hex }));

    const payload = {
      name: f.name.trim(),
      slug: (f.slug || slugify(f.name)).trim(),
      model: f.model.trim() || f.name.trim(),
      description: f.description.trim(),
      categoryId: f.categoryId ? Number(f.categoryId) : null,
      price: cleanVariants.length ? Math.min(...cleanVariants.map((v) => v.price)) : Number(f.price),
      oldPrice: f.oldPrice === '' ? null : Number(f.oldPrice),
      stock: Number(f.stock) || 0,
      storages: cleanVariants.map((v) => v.storage),
      variants: cleanVariants,
      colors: cleanColors,
      images: f.images,
      isNew: f.isNew,
      isPromo: f.isPromo,
      isFeatured: f.isFeatured,
      isTopSale: f.isTopSale,
      newAvailable: f.newAvailable,
      lebalmaEligible: f.lebalmaEligible,
      lebalmaFrequency: f.lebalmaEligible ? f.lebalmaFrequency : null,
      lebalmaDownPercent: Number(f.lebalmaDownPercent) || 0,
      lebalmaMonths: Number(f.lebalmaMonths) || 0,
      lebalmaMultiplier: Number(f.lebalmaMultiplier) || 1,
    };

    setSaving(true);
    try {
      if (isEdit) await adminService.updateProduct(product.id, payload);
      else await adminService.createProduct(payload);
      onSaved?.();
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data?.errors?.[0]?.msg || 'Échec de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {/* Infos de base */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label dark:text-white/80">Nom *</label>
          <input className="input" value={f.name} onChange={(e) => onName(e.target.value)} placeholder="iPhone 15 Pro" />
        </div>
        <div>
          <label className="label dark:text-white/80">Slug</label>
          <input
            className="input"
            value={f.slug}
            onChange={(e) => set({ slug: e.target.value, slugTouched: true })}
            placeholder="iphone-15-pro"
          />
        </div>
        <div>
          <label className="label dark:text-white/80">Catégorie</label>
          <select className="input" value={f.categoryId} onChange={(e) => set({ categoryId: e.target.value })}>
            <option value="">— Aucune —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label dark:text-white/80">Modèle</label>
          <input className="input" value={f.model} onChange={(e) => set({ model: e.target.value })} placeholder="iPhone 15 Pro" />
        </div>
      </div>

      <div>
        <label className="label dark:text-white/80">Description</label>
        <textarea className="input min-h-20" value={f.description} onChange={(e) => set({ description: e.target.value })} />
      </div>

      {/* Prix & stock */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label dark:text-white/80">Prix (FCFA) *</label>
          <input type="number" className="input" value={f.price} onChange={(e) => set({ price: e.target.value })} placeholder="150000" />
        </div>
        <div>
          <label className="label dark:text-white/80">Ancien prix (FCFA)</label>
          <input type="number" className="input" value={f.oldPrice} onChange={(e) => set({ oldPrice: e.target.value })} />
        </div>
        <div>
          <label className="label dark:text-white/80">Stock</label>
          <input type="number" className="input" value={f.stock} onChange={(e) => set({ stock: e.target.value })} />
        </div>
      </div>

      {/* Variantes (capacité / prix) */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label mb-0 dark:text-white/80">Capacités & prix</label>
          <button type="button" onClick={addVariant} className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
            <FiPlus size={14} /> Ajouter
          </button>
        </div>
        <p className="mb-2 text-xs text-muted">Le prix « à partir de » sera la capacité la moins chère.</p>
        <div className="space-y-2">
          {f.variants.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className="input flex-1" placeholder="128 Go" value={v.storage} onChange={(e) => updVariant(i, { storage: e.target.value })} />
              <input type="number" className="input w-36" placeholder="Prix" value={v.price} onChange={(e) => updVariant(i, { price: e.target.value })} />
              <button type="button" onClick={() => rmVariant(i)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-danger hover:bg-danger/10" aria-label="Retirer">
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
          {f.variants.length === 0 && <p className="text-xs text-muted">Aucune variante — le prix de base est utilisé.</p>}
        </div>
      </div>

      {/* Couleurs */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label mb-0 dark:text-white/80">Couleurs</label>
          <button type="button" onClick={addColor} className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
            <FiPlus size={14} /> Ajouter
          </button>
        </div>
        <div className="space-y-2">
          {f.colors.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className="input flex-1" placeholder="Noir" value={c.name} onChange={(e) => updColor(i, { name: e.target.value })} />
              <input type="color" className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-line bg-white dark:border-white/15" value={c.hex} onChange={(e) => updColor(i, { hex: e.target.value })} />
              <button type="button" onClick={() => rmColor(i)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-danger hover:bg-danger/10" aria-label="Retirer">
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="label dark:text-white/80">Photos (max 6)</label>
        <div className="flex flex-wrap gap-3">
          {f.images.map((src, i) => (
            <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl ring-1 ring-line dark:ring-white/10">
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => set({ images: f.images.filter((_, idx) => idx !== i) })}
                className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white"
                aria-label="Supprimer la photo"
              >
                <FiX size={12} />
              </button>
            </div>
          ))}
          {f.images.length < 6 && (
            <label className={cn(
              'grid h-20 w-20 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-line text-center text-xs text-muted transition hover:border-accent hover:text-accent dark:border-white/15',
              uploading && 'pointer-events-none opacity-60'
            )}>
              {uploading ? '…' : <span className="flex flex-col items-center gap-1"><FiUploadCloud size={18} /> Ajouter</span>}
              <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={(e) => { handleUpload(e.target.files); e.target.value = ''; }} />
            </label>
          )}
        </div>
      </div>

      {/* Options / flags */}
      <div className="flex flex-wrap gap-2">
        {FLAGS.map((flag) => (
          <button
            key={flag.key}
            type="button"
            onClick={() => set({ [flag.key]: !f[flag.key] })}
            className={cn('rounded-full border px-3 py-1.5 text-xs font-semibold transition',
              f[flag.key]
                ? 'border-accent bg-accent-light text-accent'
                : 'border-line text-muted hover:border-primary dark:border-white/15')}
          >
            {flag.label}
          </button>
        ))}
      </div>

      {/* Lebalma */}
      <div className="rounded-2xl border border-line p-4 dark:border-white/10">
        <label className="flex cursor-pointer items-center gap-2 font-semibold dark:text-white">
          <input type="checkbox" checked={f.lebalmaEligible} onChange={(e) => set({ lebalmaEligible: e.target.checked })} />
          Éligible au financement Lebalma
        </label>
        {f.lebalmaEligible && (
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <div>
              <label className="label dark:text-white/80">Fréquence</label>
              <select className="input" value={f.lebalmaFrequency} onChange={(e) => set({ lebalmaFrequency: e.target.value })}>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuelle</option>
              </select>
            </div>
            <div>
              <label className="label dark:text-white/80">Acompte (%)</label>
              <input type="number" className="input" value={f.lebalmaDownPercent} onChange={(e) => set({ lebalmaDownPercent: e.target.value })} />
            </div>
            <div>
              <label className="label dark:text-white/80">Nb d'échéances</label>
              <input type="number" className="input" value={f.lebalmaMonths} onChange={(e) => set({ lebalmaMonths: e.target.value })} />
            </div>
            <div>
              <label className="label dark:text-white/80">Multiplicateur</label>
              <input type="number" step="0.1" className="input" value={f.lebalmaMultiplier} onChange={(e) => set({ lebalmaMultiplier: e.target.value })} />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-line pt-4 dark:border-white/10">
        <button type="button" onClick={onClose} className="btn-outline">Annuler</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer le produit'}
        </button>
      </div>
    </form>
  );
}
