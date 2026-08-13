import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuthModal } from '@/context/AuthModalContext';
import { isAdmin } from '@/utils/roles';

/**
 * Rend l'authentification FLOTTANTE : les routes /login, /register et
 * /mot-de-passe-oublie n'affichent plus une page pleine mais ouvrent la modale
 * d'auth par-dessus l'accueil (redirection vers « / » + ouverture de la modale).
 * @param {'login'|'register'|'forgot'} mode
 */
export default function AuthGate({ mode = 'login' }) {
  const { openAuth } = useAuthModal() || {};
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      // Déjà connecté : pas de modale, on va à l'espace approprié.
      navigate(isAdmin(user) ? '/admin' : '/', { replace: true });
    } else {
      navigate('/', { replace: true });
      openAuth?.(mode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
