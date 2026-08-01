import { useState } from 'react';
import { FiStar, FiEye, FiSend, FiUsers } from 'react-icons/fi';
import { adminService } from '@/services/admin.service';

/** Panneau des recommandations personnalisées (aperçu + envoi test/tous). */
export default function Recommendations() {
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function preview() {
    setBusy('preview'); setError(''); setMsg('');
    try {
      const html = await adminService.recommendationsPreview();
      const w = window.open('', '_blank');
      if (w) { w.document.open(); w.document.write(html); w.document.close(); }
      else setError('Autorisez les fenêtres pop-up pour prévisualiser.');
    } catch {
      setError("Impossible de générer l'aperçu.");
    } finally {
      setBusy('');
    }
  }

  async function run(audience) {
    setBusy(audience); setError(''); setMsg('');
    try {
      const r = await adminService.recommendationsRun({ audience });
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
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
          <FiStar size={20} />
        </span>
        <div className="flex-1">
          <h2 className="font-bold dark:text-white">Recommandations personnalisées</h2>
          <p className="mt-0.5 text-sm text-muted">
            E-mail « sélection pour vous », adapté à chaque client selon son historique d'achat.
          </p>
        </div>
      </div>

      {msg && <p className="mt-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{msg}</p>}
      {error && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button onClick={preview} disabled={!!busy} className="btn-outline">
          <FiEye size={15} /> {busy === 'preview' ? 'Génération…' : 'Aperçu'}
        </button>
        <button onClick={() => run('test')} disabled={!!busy} className="btn-outline">
          <FiSend size={15} /> {busy === 'test' ? 'Envoi…' : "M'envoyer un test"}
        </button>
        <button onClick={() => run('all')} disabled={!!busy} className="btn-primary">
          <FiUsers size={15} /> {busy === 'all' ? 'Envoi…' : 'Envoyer à tous les clients'}
        </button>
      </div>

      <p className="mt-3 text-xs text-muted">
        Chaque client reçoit une sélection différente (catégories déjà achetées, avec repli sur les nouveautés). Sans SMTP, les envois sont simulés.
      </p>
    </div>
  );
}
