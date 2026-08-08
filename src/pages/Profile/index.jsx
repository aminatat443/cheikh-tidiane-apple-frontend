import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { FiSave, FiCheckCircle } from 'react-icons/fi';
import { userService } from '@/services/auth.service';
import { deliveryService } from '@/services/delivery.service';
import { fetchMe } from '@/store/authSlice';

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { data: zonesResp } = useQuery({ queryKey: ['delivery', 'zones'], queryFn: () => deliveryService.zones() });
  const zones = zonesResp?.data || [];

  const [form, setForm] = useState({ name: '', phone: '', address: '', deliveryZone: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        deliveryZone: user.deliveryZone || '',
      });
    }
  }, [user]);

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setSaved(false); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await userService.updateProfile(form);
      await dispatch(fetchMe());
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  };

  const incomplete = !user?.phone || !user?.address;

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-extrabold dark:text-white">Mon profil</h1>

      {incomplete && (
        <p className="mb-6 rounded-xl bg-accent-light px-4 py-3 text-sm text-accent dark:bg-white/5">
          Complétez votre téléphone et votre adresse pour commander plus vite la prochaine fois.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <form onSubmit={save} className="card p-6 md:col-span-2">
          <h2 className="font-bold dark:text-white">Informations</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label dark:text-white/80">Nom complet</label>
              <input className="input" value={form.name} onChange={set('name')} placeholder="Votre nom" />
            </div>
            <div>
              <label className="label dark:text-white/80">Email</label>
              <input className="input bg-surface dark:bg-primary-800" value={user?.email || ''} disabled />
            </div>
            <div>
              <label className="label dark:text-white/80">Téléphone</label>
              <input className="input" value={form.phone} onChange={set('phone')} placeholder="+221 77 000 00 00" />
            </div>
            <div className="sm:col-span-2">
              <label className="label dark:text-white/80">Adresse de livraison</label>
              <input className="input" value={form.address} onChange={set('address')} placeholder="Quartier, rue, repère…" />
            </div>
            <div className="sm:col-span-2">
              <label className="label dark:text-white/80">Zone de livraison</label>
              <select className="input" value={form.deliveryZone} onChange={set('deliveryZone')}>
                <option value="">— Choisir une zone —</option>
                {zones.map((z) => (
                  <option key={z.key} value={z.key}>{z.label}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

          <div className="mt-5 flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              <FiSave /> {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success">
                <FiCheckCircle size={16} /> Enregistré
              </span>
            )}
          </div>

          <div className="mt-6 flex justify-between border-t border-line pt-4 text-sm dark:border-white/10">
            <span className="text-muted">KYC Lebalma</span>
            <span className="font-medium dark:text-white">{user?.isKycVerified ? 'Vérifié ✅' : 'Non vérifié'}</span>
          </div>
        </form>

        <div className="card h-fit p-6">
          <h2 className="font-bold dark:text-white">Raccourcis</h2>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link to="/orders" className="text-accent hover:underline">Mes commandes</Link>
            <Link to="/mes-financements" className="text-accent hover:underline">Mes contrats Lebalma</Link>
            <Link to="/returns" className="text-accent hover:underline">Mes retours</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
