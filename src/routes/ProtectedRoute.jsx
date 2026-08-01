import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from '@/components/ui/Loader';
import { isAdmin } from '@/utils/roles';

/** Protège les routes nécessitant une connexion (et éventuellement le rôle admin). */
export default function ProtectedRoute({ adminOnly = false }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const token = localStorage.getItem('token');

  if (!token && !isAuthenticated) return <Navigate to="/login" replace />;

  // Session en cours de restauration (token présent mais profil pas encore chargé)
  if (token && !user) return <Loader />;

  if (adminOnly && !isAdmin(user)) return <Navigate to="/" replace />;

  return <Outlet />;
}
