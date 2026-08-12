import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import { authService } from '@/services/auth.service';

/** Confirme l'adresse e-mail via le lien reçu (?token=…). Appel automatique au montage. */
export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return; // évite le double appel (StrictMode)
    called.current = true;
    if (!token) {
      setStatus('error');
      setMessage('Lien de confirmation incomplet.');
      return;
    }
    authService
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Lien invalide ou expiré.');
      });
  }, [token]);

  return (
    <div className="container-page flex justify-center py-16">
      <div className="card w-full max-w-md p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="mx-auto mb-4 grid h-12 w-12 animate-spin place-items-center rounded-2xl bg-accent-light text-accent">
              <FiLoader size={24} />
            </div>
            <h1 className="text-xl font-extrabold dark:text-white">Confirmation en cours…</h1>
            <p className="mt-2 text-sm text-muted">Un instant, nous vérifions votre lien.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-success/10 text-success">
              <FiCheckCircle size={24} />
            </div>
            <h1 className="text-xl font-extrabold dark:text-white">E-mail confirmé 🎉</h1>
            <p className="mt-2 text-sm text-muted">Votre adresse e-mail est vérifiée. Votre compte est entièrement actif.</p>
            <div className="mt-6 flex flex-col gap-2">
              <Link to="/login" className="btn-primary w-full">Se connecter</Link>
              <Link to="/" className="btn-outline w-full">Aller à la boutique</Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-danger/10 text-danger">
              <FiXCircle size={24} />
            </div>
            <h1 className="text-xl font-extrabold dark:text-white">Confirmation impossible</h1>
            <p className="mt-2 text-sm text-muted">{message}</p>
            <p className="mt-1 text-sm text-muted">
              Reconnectez-vous et demandez un nouvel e-mail de confirmation depuis votre profil.
            </p>
            <Link to="/login" className="btn-primary mt-6 w-full">Se connecter</Link>
          </>
        )}
      </div>
    </div>
  );
}
