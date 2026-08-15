import { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiHeart, FiShoppingBag, FiChevronRight, FiChevronLeft, FiCheck, FiTruck, FiShield, FiLock, FiPhone, FiBell, FiZoomIn, FiX,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Loader from '@/components/ui/Loader';
import Rating from '@/components/ui/Rating';
import ProductMedia from '@/components/product/ProductMedia';
import ProductCarousel from '@/components/product/ProductCarousel';
import ProductReviews from '@/components/product/ProductReviews';
import { productService } from '@/services/product.service';
import { addItem } from '@/store/cartSlice';
import { toggleFavorite } from '@/store/favoriteSlice';
import { formatPrice, computeLebalma, cn } from '@/utils/format';
import { productGallery } from '@/utils/media';
import { WHATSAPP_NUMBER } from '@/constants';

const TRUST = [
  { icon: FiTruck, t: 'Livraison rapide', s: 'Dakar & régions' },
  { icon: FiShield, t: 'Produit garanti', s: 'Garantie officielle' },
  { icon: FiLock, t: 'Paiement sécurisé', s: 'Wave · OM · carte' },
  { icon: FiPhone, t: 'Support client', s: '7j/7 par WhatsApp' },
];

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [color, setColor] = useState(null);
  const [storage, setStorage] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [condition, setCondition] = useState('reconditionne');
  const [alertState, setAlertState] = useState('idle'); // idle | sending | done | error

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getOne(id),
  });
  const product = data?.data?.product;

  const { data: relatedData } = useQuery({
    queryKey: ['related', product?.category?.slug, id],
    queryFn: () => productService.list({ category: product.category?.slug, limit: 16 }),
    enabled: !!product?.category?.slug,
  });

  const isFav = useSelector((s) => s.favorites.items.some((p) => p.id === Number(id)));

  if (isLoading) return <Loader />;
  if (!product) return <p className="container-page py-24 text-center">Produit introuvable.</p>;

  const images = productGallery(product, 4);

  const variants =
    Array.isArray(product.variants) && product.variants.length
      ? product.variants
      : (product.storages || []).map((s) => ({ storage: s, price: product.price }));
  const activeStorage = storage ?? variants[0]?.storage ?? null;
  const activeVariant = variants.find((v) => v.storage === activeStorage) || variants[0];
  const activePrice = activeVariant?.price ?? product.price;

  const conditionOptions = [
    { value: 'reconditionne', label: 'Reconditionné' },
    ...(product.newAvailable ? [{ value: 'neuf', label: 'Neuf' }] : []),
  ];
  const conditionLabel =
    conditionOptions.find((o) => o.value === condition)?.label || 'Reconditionné';
  const firstColor = product.colors?.[0];
  const firstColorName = firstColor?.name || firstColor;
  const activeColor = color ?? firstColorName ?? null;
  const discount =
    product.oldPrice > activePrice
      ? Math.round(((product.oldPrice - activePrice) / product.oldPrice) * 100)
      : 0;
  const lebalma = computeLebalma(activePrice, product);
  const specs = product.specs && typeof product.specs === 'object' ? Object.entries(product.specs) : [];
  const inStock = product.stock == null || product.stock > 0;
  // Stock par couleur : si la couleur sélectionnée a un stock renseigné, la
  // disponibilité dépend de CETTE couleur (et non du stock global uniquement).
  const selColor = (product.colors || []).find((c) => (c.name || c) === activeColor);
  const colorStock = selColor && typeof selColor.stock === 'number' ? selColor.stock : null;
  const colorInStock = colorStock == null || colorStock > 0;
  const canBuy = inStock && colorInStock;
  const related = (relatedData?.data || []).filter((p) => p.id !== Number(id)).slice(0, 12);

  const addToCart = () =>
    dispatch(addItem({ product, color: activeColor, storage: activeStorage, condition: conditionLabel, price: activePrice }));

  async function notifyMe() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setAlertState('sending');
    try {
      await productService.subscribeStockAlert(id);
      setAlertState('done');
    } catch {
      setAlertState('error');
    }
  }

  return (
    <div className="container-page py-6 pb-28 sm:py-8 lg:pb-8">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-xs text-muted">
        <Link to="/" className="transition-colors hover:text-primary dark:hover:text-white">Accueil</Link>
        <FiChevronRight size={12} />
        <Link to={`/products?category=${product.category?.slug || ''}`} className="transition-colors hover:text-primary dark:hover:text-white">
          {product.category?.name || 'Produits'}
        </Link>
        <FiChevronRight size={12} />
        <span className="truncate text-primary dark:text-white">{product.name}</span>
      </nav>

      <div className="mt-6 grid animate-fade-in gap-10 lg:grid-cols-2">
        {/* Galerie (sticky) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="group relative">
            {images.length > 0 ? (
              <div className="aspect-square overflow-hidden rounded-3xl bg-surface shadow-card ring-1 ring-line/60 dark:bg-primary-800 dark:ring-white/10">
                <img
                  src={images[activeImg] || images[0]}
                  alt={product.name}
                  decoding="async"
                  onClick={() => setZoom(true)}
                  className="h-full w-full cursor-zoom-in object-cover transition-transform duration-700 ease-smooth group-hover:scale-105"
                />
              </div>
            ) : (
              <ProductMedia
                product={product}
                className="aspect-square rounded-3xl bg-surface shadow-card ring-1 ring-line/60 dark:bg-primary-800 dark:ring-white/10"
              />
            )}
            <div className="absolute left-4 top-4 flex flex-col gap-1.5">
              {discount > 0 && (
                <span className="rounded-full bg-danger px-3 py-1 text-[11px] font-bold text-white shadow-soft">−{discount}%</span>
              )}
            </div>

            {/* Loupe → zoom plein écran */}
            {images.length > 0 && (
              <button
                type="button"
                onClick={() => setZoom(true)}
                aria-label="Agrandir l'image"
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-primary shadow-card backdrop-blur transition hover:bg-white hover:text-accent dark:bg-primary-900/80 dark:text-white"
              >
                <FiZoomIn size={17} />
              </button>
            )}
            {zoom && images.length > 0 && (
              <div
                className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                onClick={() => setZoom(false)}
                role="dialog"
                aria-modal="true"
              >
                <button
                  type="button"
                  onClick={() => setZoom(false)}
                  aria-label="Fermer"
                  className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <FiX size={22} />
                </button>
                <img
                  src={images[activeImg] || images[0]}
                  alt={product.name}
                  onClick={(e) => e.stopPropagation()}
                  className="max-h-[90vh] max-w-[92vw] rounded-2xl object-contain"
                />
              </div>
            )}

            {/* Flèches de défilement des photos (conditionnelles) */}
            {images.length > 1 && (
              <>
                {activeImg > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveImg(activeImg - 1)}
                    aria-label="Photo précédente"
                    className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-primary shadow-card backdrop-blur transition hover:bg-white hover:text-accent dark:bg-primary-900/80 dark:text-white"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                )}
                {activeImg < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveImg(activeImg + 1)}
                    aria-label="Photo suivante"
                    className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-primary shadow-card backdrop-blur transition hover:bg-white hover:text-accent dark:bg-primary-900/80 dark:text-white"
                  >
                    <FiChevronRight size={20} />
                  </button>
                )}
                <span className="absolute bottom-3 right-3 rounded-full bg-primary/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  {activeImg + 1} / {images.length}
                </span>
              </>
            )}
          </div>

          {/* Miniatures */}
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    'aspect-square overflow-hidden rounded-2xl bg-surface ring-1 transition dark:bg-primary-800',
                    activeImg === i ? 'ring-2 ring-accent ring-offset-2 dark:ring-offset-primary-950' : 'ring-line hover:ring-primary dark:ring-white/10'
                  )}
                  aria-label={`Photo ${i + 1}`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div>
          {product.category?.name && (
            <p className="eyebrow">{product.category.name}</p>
          )}
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tighter dark:text-white sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {product.ratingAvg > 0 && <Rating value={product.ratingAvg} count={product.ratingCount || undefined} />}
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                {product.stock != null && product.stock <= 5 ? `Plus que ${product.stock} en stock` : 'En stock'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger">
                <span className="h-1.5 w-1.5 rounded-full bg-danger" /> Rupture de stock
              </span>
            )}
          </div>

          {/* Prix */}
          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-extrabold tracking-tight dark:text-white">{formatPrice(activePrice)}</span>
            {discount > 0 && <span className="text-muted line-through">{formatPrice(product.oldPrice)}</span>}
            {product.lebalmaEligible && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-light px-3 py-1 text-xs font-semibold text-accent">
                <FiCheck size={13} /> Éligible Lebalma
              </span>
            )}
          </div>
          {discount > 0 && (
            <p className="mt-1 text-sm font-semibold text-success">
              Vous économisez {formatPrice(product.oldPrice - activePrice)}
            </p>
          )}

          {product.description && (
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted">{product.description}</p>
          )}

          {/* État du produit */}
          <div className="mt-7">
            <p className="mb-2.5 text-sm font-semibold dark:text-white">État</p>
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
                  const soldOut = typeof c.stock === 'number' && c.stock <= 0;
                  return (
                    <button
                      key={name}
                      onClick={() => setColor(name)}
                      className={cn(
                        'grid h-9 w-9 place-items-center rounded-full ring-2 ring-offset-2 transition dark:ring-offset-primary-950',
                        activeColor === name ? 'ring-accent' : 'ring-transparent hover:ring-line',
                        soldOut && 'opacity-40'
                      )}
                      style={{ background: c.hex || '#ccc' }}
                      title={soldOut ? `${name} (rupture)` : name}
                      aria-label={soldOut ? `${name} (rupture)` : name}
                    >
                      {activeColor === name && <FiCheck className="text-white mix-blend-difference" size={14} />}
                    </button>
                  );
                })}
              </div>
              {/* Dispo de la couleur sélectionnée */}
              {colorStock === 0 && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-danger">
                  <span className="h-1.5 w-1.5 rounded-full bg-danger" /> Rupture pour « {activeColor} »
                </p>
              )}
              {colorStock != null && colorStock > 0 && colorStock <= 5 && (
                <p className="mt-2 text-sm font-medium text-warning">Plus que {colorStock} en « {activeColor} »</p>
              )}
            </div>
          )}

          {/* Capacités */}
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
            <button onClick={addToCart} disabled={!canBuy} className="btn-dark flex-1">
              <FiShoppingBag /> {inStock ? 'Ajouter au panier' : 'Indisponible'}
            </button>
            <button
              onClick={() => dispatch(toggleFavorite(product))}
              className={cn('btn-outline', isFav && 'border-danger text-danger hover:bg-danger hover:text-white')}
              aria-label="Favoris"
            >
              <FiHeart fill={isFav ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Alerte retour en stock (rupture) */}
          {!inStock && (
            <div className="mt-4">
              {alertState === 'done' ? (
                <p className="inline-flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm font-semibold text-success">
                  <FiCheck size={16} /> Parfait ! Vous serez averti dès le retour en stock.
                </p>
              ) : (
                <>
                  <button
                    onClick={notifyMe}
                    disabled={alertState === 'sending'}
                    className="btn-outline w-full sm:w-auto"
                  >
                    <FiBell size={16} /> {alertState === 'sending' ? 'Enregistrement…' : 'Prévenez-moi quand c\'est dispo'}
                  </button>
                  {alertState === 'error' && (
                    <p className="mt-2 text-sm text-danger">Une erreur est survenue. Réessayez.</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Financement Lebalma */}
          {lebalma && (
            <div className="mt-8 overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent-light to-white p-5 shadow-card dark:border-white/10 dark:from-primary-800 dark:to-primary-900">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-accent">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-white shadow-glow">₣</span>
                  Payez avec Lebalma
                </h3>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-accent shadow-soft dark:bg-white/10">
                  {lebalma.months} mois
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/70 p-3 dark:bg-white/5">
                  <p className="text-xs text-muted">Acompte ({lebalma.downPaymentPercent}%)</p>
                  <p className="text-lg font-extrabold text-primary dark:text-white">{formatPrice(lebalma.downPaymentAmount)}</p>
                  <p className="text-[11px] text-muted">à payer maintenant</p>
                </div>
                <div className="rounded-2xl bg-white/70 p-3 dark:bg-white/5">
                  <p className="text-xs text-muted">Mensualité</p>
                  <p className="text-lg font-extrabold text-accent">{formatPrice(lebalma.installmentAmount)}</p>
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
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-[#1ebe5b]"
              >
                <FaWhatsapp size={18} /> Souscrire au Lebalma
              </a>
            </div>
          )}

          {/* Réassurance */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TRUST.map(({ icon: Icon, t, s }) => (
              <div key={t} className="rounded-2xl bg-surface px-3 py-3.5 text-center dark:bg-primary-800">
                <Icon className="mx-auto text-accent" size={19} />
                <p className="mt-1.5 text-xs font-semibold text-primary dark:text-white">{t}</p>
                <p className="text-[10px] text-muted">{s}</p>
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

      {/* Notes & avis */}
      <ProductReviews product={product} />

      {/* Vous aimerez aussi */}
      {related.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="eyebrow">Sélection</p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight dark:text-white">Vous aimerez aussi</h2>
            </div>
            <Link to={`/products?category=${product.category?.slug || ''}`} className="hidden text-sm font-semibold text-accent hover:underline sm:inline">
              Voir tout
            </Link>
          </div>
          <ProductCarousel products={related} />
        </section>
      )}

      {/* Barre d'achat fixe (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/90 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-primary-900/90 lg:hidden">
        <div className="container-page flex items-center gap-3 px-0">
          <div className="min-w-0">
            <p className="truncate text-xs text-muted">{product.name}</p>
            <p className="text-lg font-extrabold tracking-tight dark:text-white">{formatPrice(activePrice)}</p>
          </div>
          <button onClick={addToCart} disabled={!canBuy} className="btn-dark ml-auto shrink-0">
            <FiShoppingBag /> {inStock ? 'Ajouter' : 'Indispo.'}
          </button>
        </div>
      </div>
    </div>
  );
}
