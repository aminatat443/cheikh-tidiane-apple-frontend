import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProductGrid from '@/components/product/ProductGrid';

export default function Favorites() {
  const items = useSelector((s) => s.favorites.items);

  if (!items.length) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-extrabold">Aucun favori</h1>
        <p className="mt-2 text-sm text-muted">Ajoutez des produits à vos favoris pour les retrouver ici.</p>
        <Link to="/products" className="btn-primary mt-6 inline-flex">Parcourir les produits</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-extrabold">Mes favoris</h1>
      <ProductGrid products={items} />
    </div>
  );
}
