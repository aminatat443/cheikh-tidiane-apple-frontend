import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import ProductMedia from '@/components/product/ProductMedia';
import { DrawerEmpty } from '@/components/ui/SideDrawer';
import { selectCartTotal, updateQuantity, removeItem } from '@/store/cartSlice';
import { formatPrice } from '@/utils/format';

/** Mini-panier (tiroir latéral). */
export default function CartDrawer({ onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.cart.items);
  const total = useSelector(selectCartTotal);
  const go = (p) => { onClose(); navigate(p); };

  if (!items.length) {
    return (
      <DrawerEmpty
        icon={FiShoppingBag}
        title="Votre panier est vide"
        desc="Parcourez nos produits Apple et ajoutez-les au panier."
        cta="Découvrir les produits"
        onCta={() => go('/products')}
      />
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <ul className="divide-y divide-line dark:divide-white/10">
          {items.map((it, i) => {
            const price = it.price ?? it.product.price;
            const variant = [it.storage, it.condition, it.color].filter(Boolean).join(' · ');
            return (
              <li key={`${it.product.id}-${it.storage}-${it.color}-${i}`} className="flex gap-3 py-3">
                <button onClick={() => go(`/products/${it.product.id}`)} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface dark:bg-primary-800">
                  <ProductMedia product={it.product} className="h-full w-full" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold dark:text-white">{it.product.name}</p>
                  {variant && <p className="truncate text-xs text-muted">{variant}</p>}
                  <p className="mt-0.5 text-sm font-bold text-accent">{formatPrice(price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="inline-flex items-center rounded-full border border-line dark:border-white/15">
                      <button onClick={() => dispatch(updateQuantity({ id: it.product.id, quantity: it.quantity - 1 }))} className="grid h-7 w-7 place-items-center text-muted hover:text-primary dark:hover:text-white" aria-label="Diminuer"><FiMinus size={13} /></button>
                      <span className="w-6 text-center text-sm font-semibold dark:text-white">{it.quantity}</span>
                      <button onClick={() => dispatch(updateQuantity({ id: it.product.id, quantity: it.quantity + 1 }))} className="grid h-7 w-7 place-items-center text-muted hover:text-primary dark:hover:text-white" aria-label="Augmenter"><FiPlus size={13} /></button>
                    </div>
                    <button onClick={() => dispatch(removeItem(it.product.id))} className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-danger/10 hover:text-danger" aria-label="Retirer"><FiTrash2 size={15} /></button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-line px-5 py-4 dark:border-white/10">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-muted">Sous-total</span>
          <span className="text-lg font-extrabold dark:text-white">{formatPrice(total)}</span>
        </div>
        <button onClick={() => go('/checkout')} className="btn-buy w-full">Passer la commande</button>
        <button onClick={() => go('/cart')} className="mt-2 block w-full text-center text-sm font-semibold text-muted transition hover:text-primary dark:hover:text-white">
          Voir le panier
        </button>
      </div>
    </>
  );
}
