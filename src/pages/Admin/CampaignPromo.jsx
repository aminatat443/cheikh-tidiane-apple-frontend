import { useState } from 'react';
import { FiMail, FiEye, FiSend, FiUsers } from 'react-icons/fi';
import Modal from '@/components/ui/Modal';
import { adminService } from '@/services/admin.service';

/**
 * Panneau d'envoi d'une campagne e-mail (générée depuis les vrais produits).
 * @param {'promo'|'newsletter'} type
 */
export default function CampaignPromo({ type = 'promo', title, description }) {
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [confirmAll, setConfirmAll] = useState(false);

  async function preview() {
    setBusy('preview'); setError(''); setMsg('');
    try {
      const html = await adminService.campaignPreview(type);
      const w = window.open('', '_blank');
      if (w) { w.document.open(); w.document.write(html); w.document.close(); }
      else setError('Autorisez les fenêtres pop-up pour prévisualiser.');
    } catch {
      setError("Impossible de générer l'aperçu.");
    } finally {
      setBusy('');
    }
  }

  async function send(audience) {
    setBusy(audience); setError(''); setMsg('');
    try {
      const r = await adminService.campaignSend(type, { audience });
      setMsg(r.message || 'Campagne traitée.');
      setConfirmAll(false);
    } catch (e) {
      setError(e.response?.data?.message || "Échec de l'envoi.");
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="card mt-6 p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-accent/40 text-accent">
          <FiMail size={20} />
        </span>
        <div className="flex-1">
          <h2 className="font-bold dark:text-white">{title}</h2>
          <p className="mt-0.5 text-sm text-muted">{description}</p>
        </div>
      </div>

      {msg && <p className="mt-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{msg}</p>}
      {error && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={preview} disabled={!!busy} className="btn-outline">
          <FiEye size={15} /> {busy === 'preview' ? 'Génération…' : 'Aperçu'}
        </button>
        <button onClick={() => send('test')} disabled={!!busy} className="btn-primary">
          <FiSend size={15} /> {busy === 'test' ? 'Envoi…' : 'Envoyer un test (à moi)'}
        </button>
        <button onClick={() => setConfirmAll(true)} disabled={!!busy} className="btn bg-accent text-white hover:bg-accent-hover">
          <FiUsers size={15} /> Envoyer à tous les clients
        </button>
      </div>

      <p className="mt-3 text-xs text-muted">
        Sans serveur SMTP configuré, les envois sont simulés (journalisés côté serveur).
      </p>

      <Modal open={confirmAll} onClose={() => setConfirmAll(false)} title="Envoyer à tous les clients" size="sm">
        <p className="text-sm text-muted">
          La campagne sera envoyée à <strong className="text-primary dark:text-white">tous les clients</strong> disposant d'une adresse e-mail. Confirmer ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setConfirmAll(false)} className="btn-outline">Annuler</button>
          <button onClick={() => send('all')} disabled={busy === 'all'} className="btn bg-accent text-white hover:bg-accent-hover">
            {busy === 'all' ? 'Envoi…' : 'Envoyer la campagne'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
