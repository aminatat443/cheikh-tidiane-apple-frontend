import { FiSearch } from 'react-icons/fi';
import ProductCard from './ProductCard';

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line/60">
      <div className="skeleton aspect-square" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-1/2 rounded" />
      </div>
    </div>
  );
}

export default function ProductGrid({ products = [], isLoading, skeletonCount = 8 }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line py-20 text-center dark:border-white/15">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-surface text-muted dark:bg-primary-800">
          <FiSearch size={22} />
        </div>
        <p className="mt-4 font-semibold text-primary dark:text-white">Aucun produit trouvé</p>
        <p className="mt-1 text-sm text-muted">Essayez de modifier vos filtres ou votre recherche.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
