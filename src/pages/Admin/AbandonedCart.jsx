import { useState } from 'react';
import { FiShoppingCart, FiEye, FiSearch, FiSend } from 'react-icons/fi';
import { adminService } from '@/services/admin.service';

/** Panneau de relance des paniers abandonnés (aperçu, détection, envoi). */
export default function AbandonedCart() {
  const [hours, setHours] = useState(4);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function preview() {
    setBusy('preview'); setError(''); setMsg('');
    try {
      const html = await adminService.abandonedCartPreview();
      const w = window.open('', '_blank');
      if (w) { w.document.open(); w.document.write(html); w.document.close(); }
      else setError('Autorisez les fenêtres pop-up pour prévisualiser.');
    } catch {
      setError("Impossible de générer l'aperçu.");
    } finally {
      setBusy('');
    }
  }

  async function run(dryRun) {
    setBusy(dryRun ? 'detect' : 'send'); setError(''); setMsg('');
    try {
      const r = await adminService.abandonedCartRun({ hours: Number(hours) || 4, dryRun });
      setMsg(r.message || 'Traitement effectué.');
    } catch (e) {
      setError(e.response?.data?.message || 'Échec du traitement.');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="card mt-6 p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-accent/40 text-accent">
          <FiShoppingCart size={20} />
        </span>
        <div className="flex-1">
          <h2 className="font-bold dark:text-white">Relance des paniers abandonnés</h2>
          <p className="mt-0.5 text-sm text-muted">
            E-mail de rappel automatique aux clients ayant laissé des articles dans leur panier.
          </p>
        </div>
      </div>

      {msg && <p className="mt-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{msg}</p>}
      {error && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <div>
          <label className="label dark:text-white/80">Inactivité (heures)</label>
          <input
            type="number"
            min="0"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="input w-28"
          />
        </div>
        <button onClick={preview} disabled={!!busy} className="btn-outline">
          <FiEye size={15} /> {busy === 'preview' ? 'Génération…' : 'Aperçu'}
        </button>
        <button onClick={() => run(true)} disabled={!!busy} className="btn-outline">
          <FiSearch size={15} /> {busy === 'detect' ? 'Analyse…' : 'Détecter'}
        </button>
        <button onClick={() => run(false)} disabled={!!busy} className="btn-primary">
          <FiSend size={15} /> {busy === 'send' ? 'Envoi…' : 'Envoyer les relances'}
        </button>
      </div>

      <p className="mt-3 text-xs text-muted">
        Astuce : planifiez <code className="rounded bg-surface px-1 py-0.5 dark:bg-white/10">npm run cron:abandoned-cart</code> (cron horaire) pour un envoi automatique. Sans SMTP, les envois sont simulés.
      </p>
    </div>
  );
}
