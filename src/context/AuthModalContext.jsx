import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/ui/Modal';
import AuthForm from '@/components/auth/AuthForm';
import { isAdmin } from '@/utils/roles';

const AuthModalContext = createContext(null);
export const useAuthModal = () => useContext(AuthModalContext);

/**
 * Fournit une modale d'authentification « flottante » ouvrable partout
 * (navbar, CTA…). La modale se démonte à la fermeture → état réinitialisé.
 */
export function AuthModalProvider({ children }) {
  const [state, setState] = useState({ open: false, mode: 'login' });
  const navigate = useNavigate();

  const openAuth = useCallback((mode = 'login') => setState({ open: true, mode }), []);
  const closeAuth = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  const onSuccess = (user) => {
    closeAuth();
    if (isAdmin(user)) navigate('/admin');
  };

  return (
    <AuthModalContext.Provider value={{ openAuth, closeAuth, isOpen: state.open }}>
      {children}
      <Modal open={state.open} onClose={closeAuth} title="" size="sm">
        <AuthForm initialMode={state.mode} onSuccess={onSuccess} />
      </Modal>
    </AuthModalContext.Provider>
  );
}
