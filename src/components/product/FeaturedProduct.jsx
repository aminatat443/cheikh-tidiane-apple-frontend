import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import ProductMedia from './ProductMedia';
import { formatPrice } from '@/utils/format';

/**
 * Vitrine d'un produit phare (façon Apple) : grand visuel + points clés + CTA.
 */
export default function FeaturedProduct({ product }) {
  if (!product) return null;

  return (
    <div className="grid overflow-hidden rounded-3xl bg-surface ring-1 ring-line dark:bg-primary-800 dark:ring-white/10 lg:grid-cols-2">
      {/* Vente flash — affiché en haut sur mobile/tablette */}
      <p className="eyebrow px-8 pt-8 sm:px-12 lg:hidden">Vente flash</p>

      {/* Visuel */}
      <div className="relative flex items-center justify-center px-8 pb-8 pt-4 sm:px-12 sm:pb-12 sm:pt-6 lg:p-12">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative w-full max-w-sm">
          <ProductMedia product={product} className="aspect-square rounded-2xl" />
        </div>
      </div>

      {/* Infos */}
      <div className="flex flex-col justify-center gap-5 p-8 sm:p-12 lg:p-16">
        <p className="eyebrow hidden lg:block">Vente flash</p>
        <h2 className="text-3xl font-extrabold tracking-tighter dark:text-white sm:text-4xl">
          {product.name}
        </h2>
        <p className="max-w-md text-muted">
          {product.description ||
            'Un concentré de technologie Apple, disponible dès maintenant en boutique.'}
        </p>

        <div className="flex flex-wrap gap-2">
          {product.category?.name && <span className="chip">{product.category.name}</span>}
          {(product.storages || []).slice(0, 2).map((s) => (
            <span key={s} className="chip">{s}</span>
          ))}
          {product.lebalmaEligible && <span className="chip chip-active">Éligible Lebalma</span>}
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold tracking-tight dark:text-white">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice > product.price && (
            <span className="text-muted line-through">{formatPrice(product.oldPrice)}</span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap gap-3">
          <Link to={`/products/${product.id}`} className="btn-buy group">
            Acheter
            <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link to={`/products/${product.id}`} className="btn-outline">
            Voir le détail
          </Link>
        </div>
      </div>
    </div>
  );
}
