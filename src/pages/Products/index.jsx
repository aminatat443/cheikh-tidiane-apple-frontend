import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ProductGrid from '@/components/product/ProductGrid';
import ProductFilters from '@/components/product/ProductFilters';
import { productService } from '@/services/product.service';
import { useDebounce } from '@/hooks/useDebounce';
import { SORT_OPTIONS, CATEGORIES } from '@/constants';
import { cn } from '@/utils/format';

const emptyFilters = {
  category: '',
  maxPrice: '',
  color: '',
  storage: '',
  lebalma: '',
  inStock: '',
  isPromo: '',
  isTopSale: '',
  sort: 'recent',
};

const categoryTabs = [{ label: 'Tous', slug: '' }, ...CATEGORIES];

export default function Products() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    ...emptyFilters,
    category: searchParams.get('category') || '',
    isPromo: searchParams.get('isPromo') || '',
    isTopSale: searchParams.get('isTopSale') || '',
  });

  useEffect(() => {
    setFilters((f) => ({
      ...f,
      category: searchParams.get('category') || '',
      isPromo: searchParams.get('isPromo') || '',
      isTopSale: searchParams.get('isTopSale') || '',
    }));
  }, [searchParams]);

  const debouncedFilters = useDebounce(filters, 250);
  const params = useMemo(() => {
    const p = {};
    Object.entries(debouncedFilters).forEach(([k, v]) => {
      if (v) p[k] = v;
    });
    return p;
  }, [debouncedFilters]);

  const { data, isLoading } = useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.list({ ...params, limit: 24 }),
  });

  const products = data?.data || [];
  const total = data?.meta?.total ?? products.length;

  return (
    <div className="container-page py-8">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">Catalogue</p>
          <h1 className="text-3xl font-extrabold tracking-tighter dark:text-white">Nos produits</h1>
          <p className="mt-1 text-sm text-muted">{total} produit(s) disponibles</p>
        </div>
        <select
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
          className="input w-auto rounded-full"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Barre de catégories (chips) */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-line pb-6 dark:border-white/10">
        {categoryTabs.map((c) => (
          <button
            key={c.label}
            onClick={() => setFilters((f) => ({ ...f, category: c.slug }))}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition',
              filters.category === c.slug
                ? 'bg-primary text-white dark:bg-white dark:text-primary'
                : 'bg-surface text-primary-700 hover:bg-primary-100 dark:bg-primary-800 dark:text-white/80 dark:hover:bg-white/10'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
        <ProductFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(emptyFilters)}
        />
        <ProductGrid products={products} isLoading={isLoading} />
      </div>
    </div>
  );
}
