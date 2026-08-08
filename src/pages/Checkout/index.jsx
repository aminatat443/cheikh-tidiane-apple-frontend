import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiMapPin, FiTruck, FiCheck, FiSearch } from 'react-icons/fi';

// Normalise (minuscule + sans accents) pour la recherche de zone.
const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
import { selectCartTotal, clearCart } from '@/store/cartSlice';
import { fetchMe } from '@/store/authSlice';
import { orderService } from '@/services/auth.service';
import { paymentService } from '@/services/payment.service';
import { deliveryService } from '@/services/delivery.service';
import { PAYMENT_METHODS } from '@/constants';
import { formatPrice, cn } from '@/utils/format';

// Moyens réglés en ligne via la passerelle (redirection).
const GATEWAY_METHODS = ['wave', 'orange_money', 'card'];

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.cart.items);
  const subtotal = useSelector(selectCartTotal);
  const user = useSelector((s) => s.auth.user);

  const { data: zonesResp } = useQuery({ queryKey: ['delivery', 'zones'], queryFn: () => deliveryService.zones() });
  const zones = zonesResp?.data || [];

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('');
  const [zoneQuery, setZoneQuery] = useState('');
  const [method, setMethod] = useState('wave');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Le téléphone du profil suffit : on ne le redemande pas s'il est déjà renseigné.
  const hasPhone = !!user?.phone;

  // Préremplissage depuis le profil (adresse mémorisée à la dernière commande).
  useEffect(() => {
    if (!user) return;
    setPhone((p) => p || user.phone || '');
    setAddress((a) => a || user.address || '');
    setZone((z) => z || user.deliveryZone || '');
  }, [user]);

  const selectedZone = useMemo(() => zones.find((z) => z.key === zone), [zones, zone]);
  const shippingFee = selectedZone?.fee ?? 0;
  const total = subtotal + shippingFee;

  const filteredZones = useMemo(() => {
    const q = norm(zoneQuery.trim());
    return q ? zones.filter((z) => norm(z.label).includes(q)) : zones;
  }, [zones, zoneQuery]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!zone) return setError('Choisissez une zone de livraison.');
    if (!address.trim()) return setError('Renseignez votre adresse de livraison.');
    const finalPhone = hasPhone ? user.phone : phone.trim();
    if (!finalPhone) return setError('Renseignez un numéro de téléphone.');
    setLoading(true);
    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          color: i.color,
          storage: i.storage,
        })),
        paymentMethod: method,
        deliveryZone: zone,
        shipping: { phone: finalPhone, address: address.trim() },
      };
      const resp = await orderService.create(payload);
      const order = resp.data;
      dispatch(clearCart());
      dispatch(fetchMe()); // rafraîchit l'adresse mémorisée pour les prochaines commandes

      if (GATEWAY_METHODS.includes(method)) {
        const pay = await paymentService.initiate({ purpose: 'order', referenceId: order.id, method });
        window.location.href = pay.data.checkoutUrl;
        return;
      }
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la commande');
      setLoading(false);
    }
  };

  if (!items.length) {
    return <div className="container-page py-20 text-center text-muted">Votre panier est vide.</div>;
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-extrabold dark:text-white">Commander</h1>
      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Livraison */}
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2">
              <FiMapPin className="text-accent" size={18} />
              <h2 className="font-bold dark:text-white">Adresse de livraison</h2>
            </div>
            {user?.name && (
              <p className="mb-4 rounded-xl bg-surface px-3 py-2 text-sm text-muted dark:bg-primary-800">
                Commande pour <span className="font-semibold text-primary dark:text-white">{user.name}</span>
                {hasPhone && <> · <span className="font-semibold text-primary dark:text-white">{user.phone}</span></>}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="input sm:col-span-2"
                placeholder="Adresse (quartier, rue, repère…)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              {/* Téléphone demandé uniquement s'il n'est pas déjà au profil */}
              {!hasPhone && (
                <input
                  className="input"
                  placeholder="Téléphone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              )}
            </div>
          </div>

          {/* Zone de livraison + tarif */}
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2">
              <FiTruck className="text-accent" size={18} />
              <h2 className="font-bold dark:text-white">Zone de livraison</h2>
            </div>
            {/* Recherche de zone en temps réel */}
            <div className="relative mb-3">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                className="input pl-9"
                placeholder="Rechercher une zone (ex. Pikine, Almadies…)"
                value={zoneQuery}
                onChange={(e) => setZoneQuery(e.target.value)}
              />
            </div>
            <div className="grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {filteredZones.map((z) => (
                <button
                  type="button"
                  key={z.key}
                  onClick={() => setZone(z.key)}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-xl border px-3.5 py-3 text-left text-sm transition',
                    zone === z.key
                      ? 'border-accent bg-accent-light dark:bg-white/5'
                      : 'border-line hover:border-primary dark:border-white/15'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        'grid h-4 w-4 shrink-0 place-items-center rounded-full border',
                        zone === z.key ? 'border-accent bg-accent text-white' : 'border-line'
                      )}
                    >
                      {zone === z.key && <FiCheck size={11} />}
                    </span>
                    <span className={cn('font-medium', zone === z.key ? 'text-accent' : 'text-primary-700 dark:text-white/80')}>
                      {z.label}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold text-muted">{formatPrice(z.fee)}</span>
                </button>
              ))}
            </div>
            {!zones.length && <p className="text-sm text-muted">Chargement des zones…</p>}
            {!!zones.length && !filteredZones.length && (
              <p className="mt-2 text-sm text-muted">Aucune zone ne correspond à « {zoneQuery} ».</p>
            )}
          </div>

          {/* Paiement */}
          <div className="card p-6">
            <h2 className="mb-4 font-bold dark:text-white">Paiement</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition',
                    method === m.value ? 'border-accent bg-accent-light dark:bg-white/5' : 'border-line hover:border-accent dark:border-white/15'
                  )}
                >
                  <input
                    type="radio"
                    name="method"
                    value={m.value}
                    checked={method === m.value}
                    onChange={() => setMethod(m.value)}
                    className="accent-accent"
                  />
                  <span className="text-sm font-medium dark:text-white/90">{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Récapitulatif */}
        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="font-bold dark:text-white">Récapitulatif</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Sous-total</dt>
              <dd className="font-medium dark:text-white">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Livraison</dt>
              <dd className="font-medium dark:text-white">
                {selectedZone ? formatPrice(shippingFee) : <span className="text-muted">à choisir</span>}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-lg font-extrabold dark:border-white/10 dark:text-white">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          {error && <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <button type="submit" disabled={loading} className="btn-buy mt-6 w-full">
            {loading ? 'Traitement…' : 'Valider la commande'}
          </button>
        </aside>
      </form>
    </div>
  );
}
