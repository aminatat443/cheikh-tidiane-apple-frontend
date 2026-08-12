import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import { authService } from '@/services/auth.service';

/** Réinitialisation du mot de passe via le lien reçu par e-mail (?token=…). */
export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (password.length < 6) return setError('Le mot de passe doit contenir au moins 6 caractères.');
    if (password !== confirm) return setError('Les deux mots de passe ne correspondent pas.');
    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Lien invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex justify-center py-16">
      <div className="card w-full max-w-md p-8">
        {!token ? (
          <div className="text-center">
            <h1 className="text-xl font-extrabold dark:text-white">Lien invalide</h1>
            <p className="mt-2 text-sm text-muted">Ce lien de réinitialisation est incomplet ou a expiré.</p>
            <Link to="/mot-de-passe-oublie" className="btn-primary mt-6 w-full">Demander un nouveau lien</Link>
          </div>
        ) : done ? (
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-success/10 text-success">
              <FiCheckCircle size={24} />
            </div>
            <h1 className="text-xl font-extrabold dark:text-white">Mot de passe réinitialisé</h1>
            <p className="mt-2 text-sm text-muted">Vous allez être redirigé vers la connexion…</p>
            <Link to="/login" className="btn-primary mt-6 w-full">Se connecter</Link>
          </div>
        ) : (
          <>
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-accent-light text-accent">
              <FiLock size={22} />
            </div>
            <h1 className="text-xl font-extrabold dark:text-white">Nouveau mot de passe</h1>
            <p className="mt-1 text-sm text-muted">Choisissez un nouveau mot de passe pour votre compte.</p>
            <form onSubmit={submit} className="mt-5 space-y-4">
              <input
                className="input"
                type="password"
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                autoFocus
              />
              <input
                className="input"
                type="password"
                placeholder="Confirmez le mot de passe"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(''); }}
              />
              {error && <p className="text-sm text-danger">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Enregistrement…' : 'Réinitialiser le mot de passe'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
