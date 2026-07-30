import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiHeart, FiShoppingBag, FiChevronRight, FiCheck, FiTruck, FiShield,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Loader from '@/components/ui/Loader';
import Rating from '@/components/ui/Rating';
import ProductMedia from '@/components/product/ProductMedia';
import { productService } from '@/services/product.service';
import { addItem } from '@/store/cartSlice';
import { toggleFavorite } from '@/store/favoriteSlice';
import { formatPrice, computeLebalma, cn } from '@/utils/format';
import { WHATSAPP_NUMBER } from '@/constants';

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [color, setColor] = useState(null);
  const [storage, setStorage] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [condition, setCondition] = useState('reconditionne');

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getOne(id),
  });
  const isFav = useSelector((s) => s.favorites.items.some((p) => p.id === Number(id)));

  if (isLoading) return <Loader />;
  const product = data?.data?.product;
  if (!product) return <p className="container-page py-24 text-center">Produit introuvable.</p>;

  const images = Array.isArray(product.images) ? product.images.slice(0, 4) : [];

  // Variantes de capacité : [{ storage, price }]. Repli sur storages/prix de base.
  const variants =
    Array.isArray(product.variants) && product.variants.length
      ? product.variants
      : (product.storages || []).map((s) => ({ storage: s, price: product.price }));
  const activeStorage = storage ?? variants[0]?.storage ?? null;
  const activeVariant = variants.find((v) => v.storage === activeStorage) || variants[0];
  const activePrice = activeVariant?.price ?? product.price;

  const conditionOptions = [
    { value: 'reconditionne', label: 'Reconditionné comme neuf' },
    ...(product.newAvailable ? [{ value: 'neuf', label: 'Neuf' }] : []),
  ];
  const conditionLabel =
    conditionOptions.find((o) => o.value === condition)?.label || 'Reconditionné comme neuf';
  const firstColor = product.colors?.[0];
  const firstColorName = firstColor?.name || firstColor;
  const activeColor = color ?? firstColorName ?? null;
  const discount =
    product.oldPrice > activePrice
      ? Math.round(((product.oldPrice - activePrice) / product.oldPrice) * 100)
      : 0;
  const lebalma = computeLebalma(activePrice, product);
  const specs = product.specs && typeof product.specs === 'object' ? Object.entries(product.specs) : [];

  return (
    <div className="container-page py-6 sm:py-8">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-xs text-muted">
        <Link to="/" className="hover:text-primary">Accueil</Link>
        <FiChevronRight size={12} />
        <Link to={`/products?category=${product.category?.slug || ''}`} className="hover:text-primary">
          {product.category?.name || 'Produits'}
        </Link>
        <FiChevronRight size={12} />
        <span className="truncate text-primary dark:text-white">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Galerie (jusqu'à 4 photos, sticky) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative">
            {images.length > 0 ? (
              <div className="aspect-square overflow-hidden rounded-3xl bg-surface ring-1 ring-line/60 dark:bg-primary-800 dark:ring-white/10">
                <img
                  src={images[activeImg] || images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <ProductMedia
                product={product}
                className="aspect-square rounded-3xl bg-surface ring-1 ring-line/60 dark:bg-primary-800 dark:ring-white/10"
              />
            )}
            <div className="absolute left-4 top-4 flex flex-col gap-1.5">
              {product.isNew && (
                <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white">Nouveau</span>
              )}
              {discount > 0 && (
                <span className="rounded-full bg-promo px-2.5 py-1 text-[11px] font-semibold text-white">−{discount}%</span>
              )}
            </div>
          </div>

          {/* Miniatures */}
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    'aspect-square overflow-hidden rounded-xl bg-surface ring-1 transition dark:bg-primary-800',
                    activeImg === i ? 'ring-2 ring-accent' : 'ring-line hover:ring-primary dark:ring-white/10'
                  )}
                  aria-label={`Photo ${i + 1}`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div>
          {product.category?.name && (
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{product.category.name}</p>
          )}
          <h1 className="mt-1 text-3xl font-extrabold tracking-tighter dark:text-white sm:text-4xl">
            {product.name}
          </h1>
          {product.ratingCount > 0 && (
            <div className="mt-2"><Rating value={product.ratingAvg} count={product.ratingCount} /></div>
          )}

          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <span className="text-3xl font-bold tracking-tight dark:text-white">{formatPrice(activePrice)}</span>
            {discount > 0 && <span className="text-muted line-through">{formatPrice(product.oldPrice)}</span>}
            {product.lebalmaEligible && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-light px-3 py-1 text-xs font-semibold text-accent">
                <FiCheck size={13} /> Éligible Lebalma
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted">{product.description}</p>
          )}

          {/* Version / état */}
          <div className="mt-7">
            <p className="mb-2.5 text-sm font-semibold dark:text-white">Version</p>
            <div className="flex flex-wrap gap-2">
              {conditionOptions.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setCondition(o.value)}
                  className={cn(
                    'rounded-xl border px-4 py-2 text-sm font-medium transition',
                    condition === o.value
                      ? 'border-accent bg-accent-light text-accent dark:bg-white/5'
                      : 'border-line text-primary-700 hover:border-primary dark:border-white/15 dark:text-white/80'
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Couleurs */}
          {product.colors?.length > 0 && (
            <div className="mt-7">
              <p className="mb-2.5 text-sm font-semibold dark:text-white">
                Couleur <span className="font-normal text-muted">— {activeColor}</span>
              </p>
              <div className="flex gap-2.5">
                {product.colors.map((c) => {
                  const name = c.name || c;
                  return (
                    <button
                      key={name}
                      onClick={() => setColor(name)}
                      className={cn(
                        'grid h-9 w-9 place-items-center rounded-full ring-2 ring-offset-2 transition dark:ring-offset-primary-950',
                        activeColor === name ? 'ring-accent' : 'ring-transparent hover:ring-line'
                      )}
                      style={{ background: c.hex || '#ccc' }}
                      title={name}
                      aria-label={name}
                    >
                      {activeColor === name && (
                        <FiCheck className="text-white mix-blend-difference" size={14} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Capacités (prix par capacité) */}
          {variants.length > 0 && (
            <div className="mt-5">
              <p className="mb-2.5 text-sm font-semibold dark:text-white">Capacité</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.storage}
                    onClick={() => setStorage(v.storage)}
                    className={cn(
                      'rounded-xl border px-4 py-2.5 text-left transition',
                      activeStorage === v.storage
                        ? 'border-accent bg-accent-light dark:bg-white/5'
                        : 'border-line hover:border-primary dark:border-white/15'
                    )}
                  >
                    <span className={cn('block text-sm font-semibold', activeStorage === v.storage ? 'text-accent' : 'text-primary-700 dark:text-white/80')}>
                      {v.storage}
                    </span>
                    <span className="block text-xs text-muted">{formatPrice(v.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => dispatch(addItem({ product, color: activeColor, storage: activeStorage, condition: conditionLabel, price: activePrice }))}
              className="btn-dark flex-1"
            >
              <FiShoppingBag /> Ajouter au panier
            </button>
            <button
              onClick={() => dispatch(toggleFavorite(product))}
              className={cn('btn-outline', isFav && 'border-danger text-danger hover:bg-danger hover:text-white')}
              aria-label="Favoris"
            >
              <FiHeart fill={isFav ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Détails du financement Lebalma */}
          {lebalma && (
            <div className="mt-8 overflow-hidden rounded-2xl border border-accent/25 bg-accent-light p-5 dark:border-white/10 dark:bg-primary-800">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-accent">Payez avec Lebalma</h3>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-accent dark:bg-white/10">
                  {lebalma.months} mois
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <p className="text-xs text-muted">Acompte ({lebalma.downPaymentPercent}%)</p>
                  <p className="text-lg font-bold text-primary dark:text-white">{formatPrice(lebalma.downPaymentAmount)}</p>
                  <p className="text-[11px] text-muted">à payer maintenant</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Mensualité</p>
                  <p className="text-lg font-bold text-accent">{formatPrice(lebalma.installmentAmount)}</p>
                  <p className="text-[11px] text-muted">× {lebalma.months} mois</p>
                </div>
              </div>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Bonjour, je souhaite souscrire au financement Lebalma pour ${product.name} ${activeStorage} — version ${conditionLabel} (${formatPrice(activePrice)}). ` +
                  `Acompte ${formatPrice(lebalma.downPaymentAmount)} (${lebalma.downPaymentPercent}%), puis ${lebalma.months} mensualités de ${formatPrice(lebalma.installmentAmount)}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-[#1ebe5b] hover:-translate-y-0.5"
              >
                <FaWhatsapp size={18} /> Souscrire au Lebalma
              </a>
            </div>
          )}

          {/* Réassurance */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-center text-xs">
            {[
              { icon: FiTruck, t: 'Livraison rapide' },
              { icon: FiShield, t: 'Produit garanti' },
            ].map(({ icon: Icon, t }) => (
              <div key={t} className="rounded-xl bg-surface px-2 py-3 dark:bg-primary-800">
                <Icon className="mx-auto text-accent" size={18} />
                <p className="mt-1.5 font-medium text-primary-700 dark:text-white/80">{t}</p>
              </div>
            ))}
          </div>

          {/* Caractéristiques */}
          {specs.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 text-lg font-bold dark:text-white">Caractéristiques</h3>
              <dl className="overflow-hidden rounded-2xl ring-1 ring-line dark:ring-white/10">
                {specs.map(([k, v], i) => (
                  <div
                    key={k}
                    className={cn(
                      'flex justify-between gap-4 px-4 py-3 text-sm',
                      i % 2 === 0 ? 'bg-surface dark:bg-primary-800' : 'bg-white dark:bg-primary-900'
                    )}
                  >
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-right font-medium text-primary dark:text-white">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
