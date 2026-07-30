import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ProductGrid from '@/components/product/ProductGrid';
import { productService } from '@/services/product.service';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['search-page', q],
    queryFn: () => productService.list({ q, limit: 24 }),
    enabled: q.length > 0,
  });

  return (
    <div className="container-page py-8">
      <h1 className="mb-1 text-2xl font-extrabold">Résultats de recherche</h1>
      <p className="mb-6 text-sm text-muted">
        {q ? `Pour « ${q} »` : 'Saisissez un terme de recherche'}
      </p>
      <ProductGrid products={data?.data} isLoading={isLoading} />
    </div>
  );
}
