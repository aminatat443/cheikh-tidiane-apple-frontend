import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/common/ScrollToTop';
import { fetchMe } from './store/authSlice';

export default function App() {
  const dispatch = useDispatch();

  // Restaure la session si un token est présent
  useEffect(() => {
    if (localStorage.getItem('token')) dispatch(fetchMe());
  }, [dispatch]);

  return (
    <>
      <ScrollToTop />
      <AppRoutes />
    </>
  );
}
