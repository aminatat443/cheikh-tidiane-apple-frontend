import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import ProductMedia from './ProductMedia';
import Rating from '@/components/ui/Rating';
import { addItem } from '@/store/cartSlice';
import { toggleFavorite } from '@/store/favoriteSlice';
import { formatPrice, cn } from '@/utils/format';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const isFav = useSelector((s) => s.favorites.items.some((p) => p.id === product.id));
  const discount =
    product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line/60 transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-card-hover dark:bg-primary-800 dark:ring-white/10">
      {/* Média */}
      <div className="relative aspect-square bg-surface dark:bg-primary-900">
        <Link to={`/products/${product.id}`} className="block h-full w-full">
          <ProductMedia
            product={product}
            className="h-full w-full"
            imgClassName="transition-transform duration-700 ease-smooth group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.isNew && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white shadow-soft">
              Nouveau
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-promo px-2.5 py-1 text-[11px] font-semibold text-white shadow-soft">
              −{discount}%
            </span>
          )}
          {product.isTopSale && (
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-primary shadow-soft ring-1 ring-line">
              ★ Top vente
            </span>
          )}
        </div>

        {/* Favori */}
        <button
          onClick={() => dispatch(toggleFavorite(product))}
          className={cn(
            'absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-soft backdrop-blur transition-all duration-200 hover:scale-110',
            isFav ? 'text-danger' : 'text-primary-400 hover:text-primary'
          )}
          aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <FiHeart size={17} fill={isFav ? 'currentColor' : 'none'} />
        </button>

        {/* CTA panier — apparaît au survol (desktop), toujours visible en tactile */}
        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 ease-smooth group-hover:translate-y-0 group-hover:opacity-100 max-sm:translate-y-0 max-sm:opacity-100">
          <button
            onClick={() => dispatch(addItem({ product }))}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary/95 py-2.5 text-sm font-semibold text-white shadow-card backdrop-blur transition hover:bg-primary"
          >
            <FiShoppingBag size={15} /> Ajouter
          </button>
        </div>
      </div>

      {/* Infos */}
      <div className="flex flex-1 flex-col p-4">
        {product.category?.name && (
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
            {product.category.name}
          </span>
        )}
        <Link
          to={`/products/${product.id}`}
          className="mt-0.5 line-clamp-1 font-semibold text-primary transition-colors hover:text-accent dark:text-white"
        >
          {product.name}
        </Link>

        {product.ratingCount > 0 && (
          <div className="mt-1">
            <Rating value={product.ratingAvg} count={product.ratingCount} />
          </div>
        )}

        <div className="mt-2 flex items-baseline gap-1.5">
          {product.variants?.length > 1 && (
            <span className="text-xs font-medium text-muted">Dès</span>
          )}
          <span className="text-lg font-bold tracking-tight text-primary dark:text-white">
            {formatPrice(product.price)}
          </span>
          {discount > 0 && (
            <span className="text-sm text-muted line-through">{formatPrice(product.oldPrice)}</span>
          )}
        </div>

        {product.lebalmaEligible && (
          <p className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-accent-light px-2 py-0.5 text-[11px] font-semibold text-accent">
            Éligible Lebalma
          </p>
        )}

      </div>
    </div>
  );
}
