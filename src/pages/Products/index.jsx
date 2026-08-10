import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiSliders } from 'react-icons/fi';
import ProductGrid from '@/components/product/ProductGrid';
import ProductFilters from '@/components/product/ProductFilters';
import SideDrawer from '@/components/ui/SideDrawer';
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    ...emptyFilters,
    category: searchParams.get('category') || '',
    isPromo: searchParams.get('isPromo') || '',
    isTopSale: searchParams.get('isTopSale') || '',
    lebalma: searchParams.get('lebalma') || '',
  });

  useEffect(() => {
    setFilters((f) => ({
      ...f,
      category: searchParams.get('category') || '',
      isPromo: searchParams.get('isPromo') || '',
      isTopSale: searchParams.get('isTopSale') || '',
      lebalma: searchParams.get('lebalma') || '',
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

  const [limit, setLimit] = useState(24);
  // Revient à 24 produits quand les filtres changent
  useEffect(() => { setLimit(24); }, [params]);

  const { data, isLoading } = useQuery({
    queryKey: ['products', params, limit],
    queryFn: () => productService.list({ ...params, limit }),
  });

  const products = data?.data || [];
  const total = data?.meta?.total ?? products.length;
  const hasMore = products.length < total;

  // Titre contextuel selon le filtre actif (Promotions, Top ventes, Lebalma, catégorie…)
  const activeCat = CATEGORIES.find((c) => c.slug === filters.category);
  const heading =
    filters.isPromo === 'true'
      ? { eyebrow: 'Offres', title: 'Promotions' }
      : filters.isTopSale === 'true'
      ? { eyebrow: 'Les préférés', title: 'Top des ventes' }
      : filters.lebalma === 'true'
      ? { eyebrow: 'Financement', title: 'Éligibles Lebalma' }
      : activeCat
      ? { eyebrow: 'Catégorie', title: activeCat.label }
      : { eyebrow: 'Catalogue', title: 'Nos produits' };

  // Nombre de filtres actifs (pour le badge du bouton mobile)
  const activeFilters = [
    filters.color,
    filters.storage,
    filters.lebalma,
    filters.inStock,
    filters.maxPrice && Number(filters.maxPrice) < 2000000 ? '1' : '',
  ].filter(Boolean).length;

  return (
    <div className="container-page py-8">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">{heading.eyebrow}</p>
          <h1 className="text-3xl font-extrabold tracking-tighter dark:text-white">{heading.title}</h1>
          <p className="mt-1 text-sm text-muted">{total} produit(s) disponibles</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setFiltersOpen(true)} className="btn-outline lg:hidden">
            <FiSliders size={15} /> Filtres
            {activeFilters > 0 && (
              <span className="ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">
                {activeFilters}
              </span>
            )}
          </button>
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
        <div>
          <ProductGrid products={products} isLoading={isLoading} />
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button onClick={() => setLimit((l) => l + 24)} className="btn-outline">
                Voir plus de produits ({total - products.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filtres en tiroir (mobile/tablette) */}
      <SideDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtres" side="left" width="max-w-xs">
        <div className="flex-1 overflow-y-auto">
          <ProductFilters embedded filters={filters} onChange={setFilters} onReset={() => setFilters(emptyFilters)} />
        </div>
        <div className="border-t border-line px-5 py-4 dark:border-white/10">
          <button onClick={() => setFiltersOpen(false)} className="btn-primary w-full">
            Voir les résultats ({total})
          </button>
        </div>
      </SideDrawer>
    </div>
  );
}
