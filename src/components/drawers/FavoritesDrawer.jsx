import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import ProductMedia from '@/components/product/ProductMedia';
import { DrawerEmpty } from '@/components/ui/SideDrawer';
import { toggleFavorite } from '@/store/favoriteSlice';
import { addItem } from '@/store/cartSlice';
import { formatPrice } from '@/utils/format';

/** Favoris (tiroir latéral). */
export default function FavoritesDrawer({ onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.favorites.items);
  const go = (p) => { onClose(); navigate(p); };

  if (!items.length) {
    return (
      <DrawerEmpty
        icon={FiHeart}
        title="Aucun favori"
        desc="Ajoutez des produits à vos favoris pour les retrouver ici."
        cta="Parcourir les produits"
        onCta={() => go('/products')}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2">
      <ul className="divide-y divide-line dark:divide-white/10">
        {items.map((p) => (
          <li key={p.id} className="flex gap-3 py-3">
            <button onClick={() => go(`/products/${p.id}`)} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface dark:bg-primary-800">
              <ProductMedia product={p} className="h-full w-full" />
            </button>
            <div className="min-w-0 flex-1">
              <button onClick={() => go(`/products/${p.id}`)} className="block w-full truncate text-left text-sm font-semibold dark:text-white">{p.name}</button>
              <p className="mt-0.5 text-sm font-bold text-accent">{formatPrice(p.price)}</p>
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => dispatch(addItem({ product: p }))} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-accent">
                  <FiShoppingBag size={13} /> Ajouter
                </button>
                <button onClick={() => dispatch(toggleFavorite(p))} className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-danger/10 hover:text-danger" aria-label="Retirer des favoris">
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
