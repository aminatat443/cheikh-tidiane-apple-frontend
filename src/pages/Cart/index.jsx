import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiTrash2 } from 'react-icons/fi';
import { updateQuantity, removeItem, selectCartTotal } from '@/store/cartSlice';
import { formatPrice } from '@/utils/format';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.cart.items);
  const total = useSelector(selectCartTotal);

  if (!items.length) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-extrabold">Votre panier est vide</h1>
        <Link to="/products" className="btn-primary mt-6 inline-flex">Continuer mes achats</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-extrabold">Mon panier</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {items.map((it) => (
            <div key={`${it.product.id}-${it.color}-${it.storage}`} className="card flex items-center gap-4 p-4">
              <div className="h-20 w-20 overflow-hidden rounded-lg bg-surface">
                {it.product.images?.[0] && (
                  <img src={it.product.images[0]} alt={it.product.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{it.product.name}</p>
                <p className="text-xs text-muted">
                  {[it.condition, it.color, it.storage].filter(Boolean).join(' · ')}
                </p>
                <p className="mt-1 text-sm font-bold text-accent">{formatPrice(it.price ?? it.product.price)}</p>
              </div>
              <input
                type="number"
                min="1"
                value={it.quantity}
                onChange={(e) => dispatch(updateQuantity({ id: it.product.id, quantity: Number(e.target.value) }))}
                className="input w-16 text-center"
              />
              <button
                onClick={() => dispatch(removeItem(it.product.id))}
                className="text-muted hover:text-danger"
                aria-label="Retirer"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>

        <aside className="card h-fit p-6">
          <h2 className="font-bold">Récapitulatif</h2>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-muted">Sous-total</span>
            <span className="font-semibold">{formatPrice(total)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted">Livraison</span>
            <span>Calculée à l'étape suivante</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn-buy mt-6 w-full">
            Passer la commande
          </button>
        </aside>
      </div>
    </div>
  );
}
