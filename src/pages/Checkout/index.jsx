import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCartTotal, clearCart } from '@/store/cartSlice';
import { orderService } from '@/services/auth.service';
import { PAYMENT_METHODS } from '@/constants';
import { formatPrice } from '@/utils/format';

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.cart.items);
  const total = useSelector(selectCartTotal);
  const [shipping, setShipping] = useState({ name: '', phone: '', address: '', city: '' });
  const [method, setMethod] = useState('wave');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setShipping((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // NB : en production, le panier serveur fait foi ; ici on envoie l'info de livraison.
      await orderService.create({ paymentMethod: method, shipping });
      dispatch(clearCart());
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return <div className="container-page py-20 text-center">Votre panier est vide.</div>;
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-extrabold">Commander</h1>
      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="mb-4 font-bold">Livraison</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input className="input" placeholder="Nom complet" value={shipping.name} onChange={set('name')} required />
              <input className="input" placeholder="Téléphone" value={shipping.phone} onChange={set('phone')} required />
              <input className="input sm:col-span-2" placeholder="Adresse" value={shipping.address} onChange={set('address')} required />
              <input className="input" placeholder="Ville" value={shipping.city} onChange={set('city')} required />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-4 font-bold">Paiement</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <label key={m.value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-3 hover:border-accent">
                  <input
                    type="radio"
                    name="method"
                    value={m.value}
                    checked={method === m.value}
                    onChange={() => setMethod(m.value)}
                    className="accent-accent"
                  />
                  <span className="text-sm font-medium">{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <aside className="card h-fit p-6">
          <h2 className="font-bold">Récapitulatif</h2>
          <div className="mt-4 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          <button type="submit" disabled={loading} className="btn-buy mt-6 w-full">
            {loading ? 'Traitement…' : 'Valider la commande'}
          </button>
        </aside>
      </form>
    </div>
  );
}
