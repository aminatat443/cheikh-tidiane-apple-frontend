import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { FiPlus, FiTrash2, FiShield, FiUser } from 'react-icons/fi';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { adminService } from '@/services/admin.service';
import { formatDate } from '@/utils/format';
import { isSuperAdmin } from '@/utils/roles';

export default function Admins() {
  const qc = useQueryClient();
  const me = useSelector((s) => s.auth.user);
  const superAdmin = isSuperAdmin(me);

  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'admins'],
    queryFn: () => adminService.listAdmins(),
    enabled: superAdmin,
  });
  const admins = data?.data || [];

  if (!superAdmin) {
    return (
      <div className="card mx-auto mt-10 max-w-lg p-8 text-center">
        <FiShield className="mx-auto text-muted" size={30} />
        <h1 className="mt-3 text-xl font-bold dark:text-white">Accès réservé au super-admin</h1>
        <p className="mt-1 text-sm text-muted">Seul Cheikh Tidiane (super-admin) peut gérer les comptes administrateurs.</p>
      </div>
    );
  }

  const set = (patch) => { setForm((p) => ({ ...p, ...patch })); setError(''); };

  async function create(e) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) return setError('Nom, email et mot de passe requis');
    if (form.password.length < 6) return setError('Mot de passe : 6 caractères minimum');
    setSaving(true);
    try {
      await adminService.createAdmin(form);
      qc.invalidateQueries({ queryKey: ['admin', 'admins'] });
      setForm({ name: '', email: '', phone: '', password: '' });
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Création impossible');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await adminService.deleteAdmin(deleting.id);
      qc.invalidateQueries({ queryKey: ['admin', 'admins'] });
      setDeleting(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Suppression impossible');
      setDeleting(null);
    }
  }

  return (
    <div>
      <PageHeader title="Administrateurs" subtitle={`${admins.length} compte(s) — gérés par le super-admin.`}>
        <button onClick={() => setOpen(true)} className="btn-primary"><FiPlus /> Créer un admin</button>
      </PageHeader>

      {error && <p className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {isLoading ? (
        <TableSkeleton cols={5} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted dark:bg-primary-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Administrateur</th>
                  <th className="px-4 py-3 font-semibold">Téléphone</th>
                  <th className="px-4 py-3 font-semibold">Rôle</th>
                  <th className="px-4 py-3 font-semibold">Créé le</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-white/10">
                {admins.map((a) => {
                  const superRow = a.role === 'superadmin';
                  return (
                    <tr key={a.id} className="group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-sm font-bold ${superRow ? 'border-accent/40 text-accent' : 'border-primary/30 text-primary dark:border-white/30 dark:text-white'}`}>
                            {superRow ? <FiShield size={16} /> : <FiUser size={16} />}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold dark:text-white">{a.name}{a.id === me.id && <span className="text-muted"> (vous)</span>}</p>
                            <p className="truncate text-xs text-muted">{a.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{a.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={superRow ? 'accent' : 'muted'}>{superRow ? 'Super-admin' : 'Admin'}</StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-muted">{formatDate(a.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        {!superRow && a.id !== me.id ? (
                          <button onClick={() => setDeleting(a)} className="ml-auto grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-danger/10 hover:text-danger sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100" aria-label="Supprimer">
                            <FiTrash2 size={16} />
                          </button>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {admins.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState icon={FiShield} title="Aucun administrateur" subtitle="Créez un compte administrateur." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Créer un admin */}
      <Modal open={open} onClose={() => setOpen(false)} title="Créer un administrateur" size="sm">
        <form onSubmit={create} className="space-y-4">
          <div>
            <label className="label dark:text-white/80">Nom complet</label>
            <input className="input" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Nom de l'admin" />
          </div>
          <div>
            <label className="label dark:text-white/80">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="admin@exemple.com" />
          </div>
          <div>
            <label className="label dark:text-white/80">Téléphone</label>
            <input className="input" value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+221 …" />
          </div>
          <div>
            <label className="label dark:text-white/80">Mot de passe</label>
            <input className="input" type="password" value={form.password} onChange={(e) => set({ password: e.target.value })} placeholder="6 caractères min." />
          </div>
          {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <div className="flex justify-end gap-3 border-t border-line pt-4 dark:border-white/10">
            <button type="button" onClick={() => setOpen(false)} className="btn-outline">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Création…' : 'Créer'}</button>
          </div>
        </form>
      </Modal>

      {/* Confirmation suppression */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Supprimer l'administrateur" size="sm">
        <p className="text-sm text-muted">
          Confirmez-vous la suppression de <strong className="text-primary dark:text-white">{deleting?.name}</strong> ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setDeleting(null)} className="btn-outline">Annuler</button>
          <button onClick={confirmDelete} className="btn bg-danger text-white hover:bg-danger/90">Supprimer</button>
        </div>
      </Modal>
    </div>
  );
}
