import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/** Protège les routes nécessitant une connexion (et éventuellement le rôle admin). */
export default function ProtectedRoute({ adminOnly = false }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const token = localStorage.getItem('token');

  if (!token && !isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;

  return <Outlet />;
}
