import { useState } from 'react';
import { FiPlus, FiTrash2, FiUploadCloud, FiX, FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
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
  { key: 'isFeatured', label: 'Vente flash' },
  { key: 'isTopSale', label: 'Top vente' },
  { key: 'newAvailable', label: 'Neuf disponible' },
];

export default function ProductForm({ product, categories = [], onClose, onSaved }) {
  const isEdit = Boolean(product?.id);
  const [f, setF] = useState(() => ({
    name: product?.name || '',
    slug: product?.slug || '',
    slugTouched: Boolean(product?.slug),
    categoryId: product?.categoryId || product?.category?.id || '',
    description: product?.description || '',
    // Le prix vient des capacités/configs. Prix promo (réduit) : reconstruit
    // si le produit est en promo (oldPrice barré > price payé).
    promoPrice: product?.oldPrice != null && Number(product?.oldPrice) > Number(product?.price ?? 0) ? (product?.price ?? '') : '',
    stock: product?.stock ?? 0,
    condition: product?.condition || 'reconditionne',
    model: product?.model || '',
    variants:
      Array.isArray(product?.variants) && product.variants.length
        ? product.variants.map((v) => ({ storage: v.storage || '', price: v.price ?? '' }))
        : [],
    colors:
      Array.isArray(product?.colors) && product.colors.length
        ? product.colors.map((c) => ({ name: c.name || c, hex: c.hex || '#111827', stock: c.stock ?? 0 }))
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

  // Champs adaptés à la catégorie : MacBook = « Configuration », sinon « Capacité ».
  const catSlug = categories.find((c) => String(c.id) === String(f.categoryId))?.slug || '';
  const isMac = catSlug === 'macbook';
  const variantLabel = isMac ? 'Configuration' : 'Capacité';
  const variantWord = isMac ? 'configuration' : 'capacité';
  const variantPlaceholder = isMac ? 'M3 · 16 Go · 512 Go' : '128 Go';

  // Stock par couleur : le stock global devient la somme des stocks couleurs.
  const hasColors = f.colors.length > 0;
  const colorsStockTotal = f.colors.reduce((s, c) => s + (Number(c.stock) || 0), 0);

  // Variantes
  const addVariant = () => set({ variants: [...f.variants, { storage: '', price: '' }] });
  const updVariant = (i, patch) =>
    set({ variants: f.variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)) });
  const rmVariant = (i) => set({ variants: f.variants.filter((_, idx) => idx !== i) });

  // Couleurs
  const addColor = () => set({ colors: [...f.colors, { name: '', hex: '#111827', stock: 0 }] });
  const updColor = (i, patch) =>
    set({ colors: f.colors.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });
  const rmColor = (i) => set({ colors: f.colors.filter((_, idx) => idx !== i) });

  // Validation côté client avant envoi (Cloudinary optimise ensuite le reste).
  const MAX_UPLOAD = 10 * 1024 * 1024; // 10 Mo
  const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  async function handleUpload(fileList) {
    const all = Array.from(fileList);
    const valid = all.filter((file) => OK_TYPES.includes(file.type) && file.size <= MAX_UPLOAD);
    const files = valid.slice(0, 6 - f.images.length);
    if (valid.length < all.length) {
      setError('Certaines images ont été ignorées — formats acceptés : JPG, PNG, WebP · 10 Mo max.');
    } else {
      setError('');
    }
    if (!files.length) return;
    setUploading(true);
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

  // Gestion des images : principale (1re position), réordonner, supprimer.
  const rmImage = (i) => set({ images: f.images.filter((_, idx) => idx !== i) });
  const setMainImage = (i) => {
    if (i === 0) return;
    const imgs = [...f.images];
    const [main] = imgs.splice(i, 1);
    imgs.unshift(main);
    set({ images: imgs });
  };
  const moveImage = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= f.images.length) return;
    const imgs = [...f.images];
    [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    set({ images: imgs });
  };

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!f.name.trim()) return setError('Le nom est requis');

    const cleanVariants = f.variants
      .filter((v) => v.storage && v.price !== '')
      .map((v) => ({ storage: v.storage.trim(), price: Number(v.price) }));
    if (!cleanVariants.length) return setError(`Ajoutez au moins une ${variantWord} avec son prix.`);

    // Le prix vient des capacités/configs ; le prix promo (s'il est plus bas) devient
    // le prix affiché, la moins chère étant barrée.
    const basePrice = Math.min(...cleanVariants.map((v) => v.price));
    const promo = f.promoPrice === '' ? null : Number(f.promoPrice);
    if (promo != null && promo >= basePrice) return setError('Le prix promo doit être inférieur au prix le plus bas.');
    const onPromo = promo != null && promo > 0 && promo < basePrice;

    const cleanColors = f.colors
      .filter((c) => c.name.trim())
      .map((c) => ({ name: c.name.trim(), hex: c.hex, stock: Number(c.stock) || 0 }));
    // Stock global = somme des stocks par couleur (si des couleurs sont définies).
    const colorsStock = cleanColors.reduce((s, c) => s + c.stock, 0);

    const payload = {
      name: f.name.trim(),
      slug: (f.slug || slugify(f.name)).trim(),
      model: f.model.trim() || f.name.trim(),
      description: f.description.trim(),
      categoryId: f.categoryId ? Number(f.categoryId) : null,
      price: onPromo ? promo : basePrice,
      oldPrice: onPromo ? basePrice : null,
      condition: f.condition,
      stock: cleanColors.length ? colorsStock : Number(f.stock) || 0,
      storages: cleanVariants.map((v) => v.storage),
      variants: cleanVariants,
      colors: cleanColors,
      images: f.images,
      isNew: f.isNew,
      isPromo: onPromo ? true : f.isPromo,
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

      {/* Prix promo · stock · état (le prix normal vient des capacités/configs) */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label dark:text-white/80">Prix promo (FCFA)</label>
          <input type="number" className="input" value={f.promoPrice} onChange={(e) => set({ promoPrice: e.target.value })} placeholder="Optionnel — prix réduit" />
        </div>
        <div>
          <label className="label dark:text-white/80">Stock{hasColors ? ' (total)' : ''}</label>
          <input type="number" className="input" value={hasColors ? colorsStockTotal : f.stock} onChange={(e) => set({ stock: e.target.value })} disabled={hasColors} />
          {hasColors && <p className="mt-1 text-[11px] text-muted">Somme des stocks par couleur.</p>}
        </div>
        <div>
          <label className="label dark:text-white/80">État</label>
          <select className="input" value={f.condition} onChange={(e) => set({ condition: e.target.value })}>
            <option value="reconditionne">Reconditionné</option>
            <option value="neuf">Neuf</option>
          </select>
        </div>
      </div>

      {/* Variantes (capacité / prix) */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label mb-0 dark:text-white/80">{variantLabel}s & prix *</label>
          <button type="button" onClick={addVariant} className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
            <FiPlus size={14} /> Ajouter
          </button>
        </div>
        <p className="mb-2 text-xs text-muted">Le prix du produit vient d'ici : le prix affiché « à partir de » sera la {variantWord} la moins chère.</p>
        <div className="space-y-2">
          {f.variants.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className="input flex-1" placeholder={variantPlaceholder} value={v.storage} onChange={(e) => updVariant(i, { storage: e.target.value })} />
              <input type="number" className="input w-36" placeholder="Prix" value={v.price} onChange={(e) => updVariant(i, { price: e.target.value })} />
              <button type="button" onClick={() => rmVariant(i)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-danger hover:bg-danger/10" aria-label="Retirer">
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
          {f.variants.length === 0 && <p className="text-xs text-muted">Ajoutez au moins une {variantWord} avec son prix (obligatoire).</p>}
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
              <input type="number" min="0" className="input w-24 shrink-0" placeholder="Stock" value={c.stock ?? 0} onChange={(e) => updColor(i, { stock: e.target.value })} aria-label="Stock de cette couleur" />
              <button type="button" onClick={() => rmColor(i)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-danger hover:bg-danger/10" aria-label="Retirer">
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
          {hasColors && <p className="text-xs text-muted">Chaque couleur a son propre stock. Le stock total du produit = somme des couleurs.</p>}
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="label dark:text-white/80">Photos (max 6)</label>
        <div className="flex flex-wrap gap-3">
          {f.images.map((src, i) => (
            <div key={i} className="group relative h-24 w-24 overflow-hidden rounded-xl ring-1 ring-line dark:ring-white/10">
              <img src={src} alt="" className="h-full w-full object-cover" />

              {/* Badge image principale (1re position) */}
              {i === 0 && (
                <span className="absolute left-1 top-1 inline-flex items-center gap-0.5 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-white">
                  <FiStar size={9} /> Principale
                </span>
              )}

              {/* Supprimer */}
              <button
                type="button"
                onClick={() => rmImage(i)}
                className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white transition hover:bg-danger"
                aria-label="Supprimer la photo"
              >
                <FiX size={12} />
              </button>

              {/* Barre d'actions (au survol) : déplacer / définir principale */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-0.5 bg-black/55 py-1 opacity-0 transition group-hover:opacity-100">
                <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="grid h-6 w-6 place-items-center rounded text-white transition hover:text-accent-400 disabled:opacity-30" aria-label="Déplacer à gauche">
                  <FiChevronLeft size={14} />
                </button>
                {i !== 0 && (
                  <button type="button" onClick={() => setMainImage(i)} className="grid h-6 w-6 place-items-center rounded text-white transition hover:text-accent-400" aria-label="Définir comme principale" title="Définir comme principale">
                    <FiStar size={13} />
                  </button>
                )}
                <button type="button" onClick={() => moveImage(i, 1)} disabled={i === f.images.length - 1} className="grid h-6 w-6 place-items-center rounded text-white transition hover:text-accent-400 disabled:opacity-30" aria-label="Déplacer à droite">
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
          {f.images.length < 6 && (
            <label className={cn(
              'grid h-24 w-24 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-line text-center text-xs text-muted transition hover:border-accent hover:text-accent dark:border-white/15',
              uploading && 'pointer-events-none opacity-60'
            )}>
              {uploading ? '…' : <span className="flex flex-col items-center gap-1"><FiUploadCloud size={18} /> Ajouter</span>}
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" disabled={uploading} onChange={(e) => { handleUpload(e.target.files); e.target.value = ''; }} />
            </label>
          )}
        </div>
        <p className="mt-2 text-xs text-muted">
          La <strong>1re image</strong> est la principale. Survolez une photo pour la <strong>déplacer</strong> ou la <strong>définir comme principale</strong>. JPG/PNG/WebP · 10 Mo max — l'optimisation (carré, fond blanc, WebP) est automatique.
        </p>
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
