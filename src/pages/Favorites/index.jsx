import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import ProductGrid from '@/components/product/ProductGrid';
import ProductCarousel from '@/components/product/ProductCarousel';
import { productService } from '@/services/product.service';

export default function Favorites() {
  const items = useSelector((s) => s.favorites.items);

  const favIds = new Set(items.map((p) => p.id));
  const favCats = [...new Set(items.map((p) => p.category?.slug).filter(Boolean))];

  // Produits similaires : mêmes catégories que les favoris, hors favoris déjà présents.
  const { data: simResp } = useQuery({
    queryKey: ['fav-similar', favCats.join(',')],
    queryFn: () => productService.list({ limit: 24 }),
    enabled: items.length > 0,
  });
  const similar = (simResp?.data || [])
    .filter((p) => !favIds.has(p.id) && (favCats.length ? favCats.includes(p.category?.slug) : true))
    .slice(0, 12);

  if (!items.length) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-extrabold dark:text-white">Aucun favori</h1>
        <p className="mt-2 text-sm text-muted">Ajoutez des produits à vos favoris pour les retrouver ici.</p>
        <Link to="/products" className="btn-primary mt-6 inline-flex">Parcourir les produits</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-extrabold dark:text-white">Mes favoris</h1>
      <ProductGrid products={items} />

      {/* Autres produits similaires (carrousel) */}
      {similar.length > 0 && (
        <section className="mt-14">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="eyebrow">Inspiré de vos favoris</p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight dark:text-white">Autres produits similaires</h2>
            </div>
            <Link to="/products" className="hidden text-sm font-semibold text-accent hover:underline sm:inline">
              Voir tout
            </Link>
          </div>
          <ProductCarousel products={similar} />
        </section>
      )}
    </div>
  );
}
