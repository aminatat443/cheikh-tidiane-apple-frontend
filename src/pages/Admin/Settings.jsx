import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiUploadCloud, FiSave, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import Loader from '@/components/ui/Loader';
import PageHeader from '@/components/ui/PageHeader';
import TwoFactorSettings from './TwoFactorSettings';
import { adminService } from '@/services/admin.service';
import { SHOP_DEFAULTS, SHOP_LOGO } from '@/constants';

const FIELDS = [
  { key: 'name', label: 'Nom de la boutique', placeholder: 'Cheikh Tidiane Apple' },
  { key: 'address', label: 'Adresse', placeholder: 'Dakar, Sénégal' },
  { key: 'phone', label: 'Téléphone', placeholder: '+221 77 000 00 00' },
  { key: 'email', label: 'Email', placeholder: 'contact@cheikhtidiane.com' },
  { key: 'ninea', label: 'NINEA', placeholder: 'Numéro fiscal' },
  { key: 'rccm', label: 'RCCM', placeholder: 'Registre du commerce' },
];

export default function Settings() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'settings'], queryFn: () => adminService.getSettings() });
  const [form, setForm] = useState(SHOP_DEFAULTS);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (data?.data) setForm({ ...SHOP_DEFAULTS, ...data.data });
  }, [data]);

  const set = (patch) => { setForm((p) => ({ ...p, ...patch })); setSaved(false); };

  async function handleStamp(fileList) {
    const file = fileList?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('images', file);
      // 'raw' : conserve la transparence du cachet/signature (pas de fond blanc forcé)
      const up = await adminService.uploadImages(fd, 'raw');
      if (up.data?.[0]) set({ stampUrl: up.data[0] });
    } catch (e) {
      setError(e.response?.data?.message || 'Échec du téléversement');
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      await adminService.updateSettings(form);
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
      setSaved(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-3xl">
      <PageHeader title="Réglages" subtitle="Coordonnées de la boutique et cachet/signature utilisés sur les factures." />

      {error && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {/* Coordonnées */}
      <div className="card mt-6 p-6">
        <h2 className="mb-4 font-bold dark:text-white">Informations de facturation</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="label dark:text-white/80">{f.label}</label>
              <input className="input" placeholder={f.placeholder} value={form[f.key] || ''} onChange={(e) => set({ [f.key]: e.target.value })} />
            </div>
          ))}
        </div>
      </div>

      {/* Cachet & signature */}
      <div className="card mt-6 p-6">
        <h2 className="mb-1 font-bold dark:text-white">Cachet &amp; signature</h2>
        <p className="mb-4 text-sm text-muted">
          Image (cachet + signature) insérée en bas des factures. PNG à fond transparent recommandé.
        </p>
        <div className="flex flex-wrap items-center gap-5">
          <div className="grid h-28 w-48 place-items-center overflow-hidden rounded-xl bg-surface ring-1 ring-line dark:bg-primary-800 dark:ring-white/10">
            {form.stampUrl ? (
              <img src={form.stampUrl} alt="Cachet et signature" className="h-full w-full object-contain p-2" />
            ) : (
              <span className="text-xs text-muted">Aucune image</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="btn-outline cursor-pointer px-4 py-2 text-sm">
              <FiUploadCloud size={15} /> {uploading ? 'Envoi…' : 'Choisir une photo'}
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { handleStamp(e.target.files); e.target.value = ''; }} />
            </label>
            {form.stampUrl && (
              <button onClick={() => set({ stampUrl: '' })} className="inline-flex items-center gap-1.5 text-sm font-semibold text-danger hover:underline">
                <FiTrash2 size={14} /> Retirer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Aperçu logo */}
      <div className="card mt-6 flex items-center gap-4 p-6">
        <img src={SHOP_LOGO} alt="Logo" className="h-12 w-auto" />
        <p className="text-sm text-muted">Logo utilisé sur l'entête des factures (<code>public/images/LOGO_CTA.png</code>).</p>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={save} disabled={saving} className="btn-primary">
          <FiSave /> {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success">
            <FiCheckCircle size={16} /> Enregistré
          </span>
        )}
      </div>

      {/* Sécurité — double authentification */}
      <TwoFactorSettings />
    </div>
  );
}
