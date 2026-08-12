import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { authService } from '@/services/auth.service';

/** « Mot de passe oublié » — saisie de l'e-mail, envoi du lien de réinitialisation. */
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!email.trim()) return setError('Entrez votre adresse e-mail.');
    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email.trim());
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex justify-center py-16">
      <div className="card w-full max-w-md p-8">
        {done ? (
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-success/10 text-success">
              <FiCheckCircle size={24} />
            </div>
            <h1 className="text-xl font-extrabold dark:text-white">Vérifiez votre boîte mail</h1>
            <p className="mt-2 text-sm text-muted">
              Si un compte existe pour <strong className="text-primary dark:text-white">{email}</strong>, vous recevrez
              un e-mail avec un lien pour réinitialiser votre mot de passe. Pensez à vérifier vos spams.
            </p>
            <Link to="/login" className="btn-primary mt-6 w-full">Retour à la connexion</Link>
          </div>
        ) : (
          <>
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-accent-light text-accent">
              <FiMail size={22} />
            </div>
            <h1 className="text-xl font-extrabold dark:text-white">Mot de passe oublié</h1>
            <p className="mt-1 text-sm text-muted">
              Entrez l'adresse e-mail de votre compte : nous vous enverrons un lien de réinitialisation.
            </p>
            <form onSubmit={submit} className="mt-5 space-y-4">
              <input
                className="input"
                type="email"
                placeholder="Votre e-mail"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                autoFocus
              />
              {error && <p className="text-sm text-danger">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Envoi…' : 'Envoyer le lien'}
              </button>
            </form>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-primary dark:hover:text-white"
            >
              <FiArrowLeft size={14} /> Retour à la connexion
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
