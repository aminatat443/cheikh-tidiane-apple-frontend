import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiShield, FiCheckCircle, FiSmartphone } from 'react-icons/fi';
import { authService } from '@/services/auth.service';
import { fetchMe } from '@/store/authSlice';

/** Réglage de la double authentification (TOTP / Google Authenticator). */
export default function TwoFactorSettings() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const enabled = !!user?.twoFactorEnabled;

  const [setup, setSetup] = useState(null); // { qr, secret }
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const onCode = (v) => { setCode(v.replace(/\D/g, '').slice(0, 6)); setError(''); };

  async function startSetup() {
    setError(''); setMsg(''); setLoading(true);
    try {
      const r = await authService.setup2fa();
      setSetup(r.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur de configuration');
    } finally {
      setLoading(false);
    }
  }

  async function confirmEnable(e) {
    e.preventDefault();
    if (code.length < 6) return setError('Entrez le code à 6 chiffres');
    setLoading(true);
    try {
      await authService.enable2fa(code);
      await dispatch(fetchMe());
      setSetup(null); setCode(''); setMsg('Double authentification activée ✅');
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  }

  async function disable(e) {
    e.preventDefault();
    if (code.length < 6) return setError('Entrez un code pour confirmer');
    setLoading(true);
    try {
      await authService.disable2fa(code);
      await dispatch(fetchMe());
      setCode(''); setMsg('Double authentification désactivée.');
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card mt-6 p-6">
      <div className="flex items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${enabled ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'}`}>
          <FiShield size={20} />
        </span>
        <div className="flex-1">
          <h2 className="font-bold dark:text-white">Double authentification (2FA)</h2>
          <p className="mt-0.5 text-sm text-muted">
            Sécurisez la connexion avec un code à usage unique (Google Authenticator, Authy…).
          </p>
        </div>
        {enabled && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
            <FiCheckCircle size={14} /> Activée
          </span>
        )}
      </div>

      {msg && <p className="mt-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{msg}</p>}
      {error && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {/* Cas 1 : activée → possibilité de désactiver */}
      {enabled ? (
        <form onSubmit={disable} className="mt-5 flex flex-wrap items-end gap-3">
          <div>
            <label className="label dark:text-white/80">Code de l'application pour désactiver</label>
            <input className="input w-40 text-center tracking-[0.3em]" inputMode="numeric" maxLength={6} placeholder="••••••" value={code} onChange={(e) => onCode(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn bg-danger text-white hover:bg-danger/90">
            {loading ? '…' : 'Désactiver'}
          </button>
        </form>
      ) : setup ? (
        /* Cas 2 : configuration en cours → QR + code */
        <div className="mt-5 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="grid place-items-center rounded-2xl bg-white p-3 ring-1 ring-line dark:ring-white/10">
            <img src={setup.qr} alt="QR code 2FA" className="h-44 w-44" />
          </div>
          <div>
            <ol className="mb-3 list-decimal space-y-1 pl-4 text-sm text-muted">
              <li>Ouvrez votre application d'authentification.</li>
              <li>Scannez le QR code (ou saisissez la clé ci-dessous).</li>
              <li>Entrez le code à 6 chiffres généré.</li>
            </ol>
            <p className="mb-3 break-all rounded-lg bg-surface px-3 py-2 font-mono text-xs text-primary dark:bg-primary-800 dark:text-white">
              {setup.secret}
            </p>
            <form onSubmit={confirmEnable} className="flex flex-wrap items-end gap-3">
              <input className="input w-40 text-center text-lg font-bold tracking-[0.3em]" inputMode="numeric" maxLength={6} placeholder="••••••" value={code} onChange={(e) => onCode(e.target.value)} autoFocus />
              <button type="submit" disabled={loading} className="btn-primary">{loading ? '…' : 'Activer'}</button>
              <button type="button" onClick={() => { setSetup(null); setCode(''); setError(''); }} className="btn-outline">Annuler</button>
            </form>
          </div>
        </div>
      ) : (
        /* Cas 3 : inactive → bouton d'activation */
        <button onClick={startSetup} disabled={loading} className="btn-primary mt-5">
          <FiSmartphone size={16} /> {loading ? 'Préparation…' : 'Activer la 2FA'}
        </button>
      )}
    </div>
  );
}
