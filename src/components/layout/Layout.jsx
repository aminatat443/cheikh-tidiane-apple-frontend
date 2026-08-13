import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ProfileReminder from '@/components/common/ProfileReminder';
import WhatsAppFab from '@/components/common/WhatsAppFab';

// Pages « espace client » où le footer est masqué (interface plus concentrée).
const NO_FOOTER = ['/profile', '/orders', '/returns', '/mes-financements', '/favorites', '/checkout', '/paiement'];

export default function Layout() {
  const { pathname } = useLocation();
  const hideFooter = NO_FOOTER.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <div className="flex min-h-screen flex-col">
      <ProfileReminder />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
      <WhatsAppFab />
    </div>
  );
}
