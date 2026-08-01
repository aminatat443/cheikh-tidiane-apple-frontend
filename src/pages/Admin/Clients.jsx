import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiSearch, FiCheckCircle, FiXCircle, FiPlus, FiUserPlus, FiUsers } from 'react-icons/fi';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { adminService } from '@/services/admin.service';
import { formatDate } from '@/utils/format';

const EMPTY = { name: '', email: '', phone: '', city: '', address: '', password: '' };

export default function Clients() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['admin', 'clients'], queryFn: () => adminService.clients() });
  const clients = data?.data || [];

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return clients;
    return clients.filter((c) => `${c.name} ${c.email} ${c.phone || ''} ${c.city || ''}`.toLowerCase().includes(t));
  }, [clients, q]);

  const kycCount = clients.filter((c) => c.isKycVerified).length;
  const set = (patch) => { setForm((p) => ({ ...p, ...patch })); setError(''); };

  async function create(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return setError('Nom et email requis');
    setSaving(true);
    try {
      await adminService.createClient({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        password: form.password || undefined,
      });
      qc.invalidateQueries({ queryKey: ['admin', 'clients'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Clients" subtitle={`${clients.length} client(s) — ${kycCount} vérifié(s) KYC (éligibles Lebalma).`}>
        <button onClick={() => { setForm(EMPTY); setError(''); setOpen(true); }} className="btn-primary">
          <FiUserPlus /> Enregistrer un nouveau client
        </button>
      </PageHeader>

      <div className="relative mt-5 max-w-sm">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
        <input className="input pl-9" placeholder="Nom, email, téléphone, ville…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {isLoading ? (
        <TableSkeleton cols={5} />
      ) : (
        <div className="card mt-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted dark:bg-primary-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Téléphone</th>
                  <th className="px-4 py-3 font-semibold">Ville</th>
                  <th className="px-4 py-3 font-semibold">KYC</th>
                  <th className="px-4 py-3 font-semibold">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-white/10">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-surface/60 dark:hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary dark:bg-white/10 dark:text-white">
                          {c.name?.charAt(0)?.toUpperCase() || 'C'}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold dark:text-white">{c.name}</p>
                          <p className="truncate text-xs text-muted">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-muted">{c.city || '—'}</td>
                    <td className="px-4 py-3">
                      {c.isKycVerified ? (
                        <StatusBadge tone="success"><FiCheckCircle size={12} /> Vérifié</StatusBadge>
                      ) : (
                        <StatusBadge tone="muted"><FiXCircle size={12} /> Non vérifié</StatusBadge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState icon={FiUsers} title="Aucun client" subtitle={q ? 'Aucun résultat pour cette recherche.' : 'Enregistrez un client pour commencer.'} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enregistrer un nouveau client (non inscrit sur le site) */}
      <Modal open={open} onClose={() => setOpen(false)} title="Enregistrer un nouveau client" size="sm">
        <form onSubmit={create} className="space-y-4">
          <div>
            <label className="label dark:text-white/80">Nom complet *</label>
            <input className="input" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Nom du client" />
          </div>
          <div>
            <label className="label dark:text-white/80">Email *</label>
            <input className="input" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="client@exemple.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label dark:text-white/80">Téléphone</label>
              <input className="input" value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+221 …" />
            </div>
            <div>
              <label className="label dark:text-white/80">Ville</label>
              <input className="input" value={form.city} onChange={(e) => set({ city: e.target.value })} placeholder="Dakar" />
            </div>
          </div>
          <div>
            <label className="label dark:text-white/80">Adresse</label>
            <input className="input" value={form.address} onChange={(e) => set({ address: e.target.value })} placeholder="Quartier, rue…" />
          </div>
          <div>
            <label className="label dark:text-white/80">Mot de passe <span className="font-normal text-muted">(optionnel)</span></label>
            <input className="input" type="text" value={form.password} onChange={(e) => set({ password: e.target.value })} placeholder="Laisser vide = généré automatiquement" />
            <p className="mt-1 text-xs text-muted">Le client pourra se connecter avec cet email et ce mot de passe.</p>
          </div>
          {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <div className="flex justify-end gap-3 border-t border-line pt-4 dark:border-white/10">
            <button type="button" onClick={() => setOpen(false)} className="btn-outline">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">
              <FiPlus /> {saving ? 'Enregistrement…' : 'Enregistrer le client'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
