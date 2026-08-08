import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiGrid, FiSmartphone, FiShoppingBag, FiCreditCard, FiFileText, FiUsers,
  FiSettings, FiLogOut, FiExternalLink, FiMenu, FiX, FiShield, FiRotateCcw, FiChevronUp, FiMoon, FiSun, FiMail, FiTrendingUp,
} from 'react-icons/fi';
import { logout } from '@/store/authSlice';
import NotificationBell from '@/components/common/NotificationBell';
import { useTheme } from '@/hooks/useTheme';
import { SHOP_LOGO } from '@/constants';
import { cn } from '@/utils/format';
import { isSuperAdmin } from '@/utils/roles';

const groups = [
  {
    title: 'Principal',
    items: [
      { to: '/admin', label: 'Tableau de bord', icon: FiGrid, end: true },
      { to: '/admin/finance', label: 'Finance', icon: FiTrendingUp },
    ],
  },
  {
    title: 'Gestion',
    items: [
      { to: '/admin/products', label: 'Produits', icon: FiSmartphone },
      { to: '/admin/orders', label: 'Commandes', icon: FiShoppingBag },
      { to: '/admin/returns', label: 'Retours', icon: FiRotateCcw },
      { to: '/admin/lebalma', label: 'Contrats Lebalma', icon: FiCreditCard },
      { to: '/admin/invoices', label: 'Factures', icon: FiFileText },
      { to: '/admin/clients', label: 'Clients', icon: FiUsers },
    ],
  },
  { title: 'Communication', items: [{ to: '/admin/campaigns', label: 'Campagnes e-mail', icon: FiMail }] },
  { title: 'Configuration', items: [{ to: '/admin/settings', label: 'Réglages', icon: FiSettings }] },
];

const superAdminGroup = { title: 'Super-admin', items: [{ to: '/admin/admins', label: 'Administrateurs', icon: FiShield }] };

// Titre de page dynamique (le plus spécifique d'abord).
const TITLES = [
  ['/admin/finance', 'Finance'],
  ['/admin/products', 'Produits'],
  ['/admin/orders', 'Commandes'],
  ['/admin/lebalma', 'Contrats Lebalma'],
  ['/admin/clients', 'Clients'],
  ['/admin/invoices', 'Factures'],
  ['/admin/returns', 'Retours'],
  ['/admin/campaigns', 'Campagnes e-mail'],
  ['/admin/settings', 'Réglages'],
  ['/admin/admins', 'Administrateurs'],
  ['/admin', 'Tableau de bord'],
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useSelector((s) => s.auth);
  const { isDark, toggle: toggleTheme } = useTheme();

  const onLogout = () => {
    dispatch(logout());
    navigate('/'); // retour à la boutique après déconnexion
  };

  const superAdmin = isSuperAdmin(user);
  const navGroups = superAdmin ? [...groups, superAdminGroup] : groups;
  const pageTitle = (TITLES.find(([p]) => pathname === p || pathname.startsWith(`${p}/`)) || ['', 'Admin'])[1];

  const SidebarBody = () => (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-primary-900 via-primary to-primary-950">
      {/* Halo décoratif haut */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-accent/10 to-transparent" />

      {/* Marque */}
      <Link to="/admin" className="relative flex items-center gap-3 px-5 py-5" onClick={() => setOpen(false)}>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 p-1.5 ring-1 ring-white/10 backdrop-blur">
          <img src={SHOP_LOGO} alt="Cheikh Tidiane Apple" className="h-full w-auto" />
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-bold tracking-tight text-white">Cheikh Tidiane</span>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-accent-400">
            {superAdmin ? 'Super-admin' : 'Administration'}
          </span>
        </span>
      </Link>

      <div className="relative flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {navGroups.map((g) => (
          <div key={g.title}>
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">{g.title}</p>
            <nav className="space-y-1">
              {g.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-3 rounded-xl py-2 pl-2 pr-3 text-sm font-medium transition-all duration-200',
                      isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={cn('absolute -left-3 top-1/2 h-6 -translate-y-1/2 rounded-r-full bg-accent transition-all duration-200', isActive ? 'w-1.5' : 'w-0')} />
                      <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-all duration-200',
                        isActive ? 'bg-accent text-white shadow-glow' : 'bg-white/5 text-white/70 group-hover:text-white')}>
                        <Icon size={16} />
                      </span>
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Profil — menu déroulant en bas */}
      <div className="relative border-t border-white/10 px-3 py-4">
        {profileOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
            <div className="absolute bottom-full left-3 right-3 z-20 mb-2 overflow-hidden rounded-2xl border border-white/10 bg-primary-800 shadow-card-hover">
              <Link
                to="/"
                onClick={() => { setProfileOpen(false); setOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <FiExternalLink size={16} /> Voir la boutique
              </Link>
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-danger transition hover:bg-white/10"
              >
                <FiLogOut size={16} /> Déconnexion
              </button>
            </div>
          </>
        )}
        <button
          onClick={() => setProfileOpen((o) => !o)}
          className="flex w-full items-center gap-3 rounded-2xl bg-white/5 px-3 py-2.5 text-left ring-1 ring-white/5 transition hover:bg-white/10"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-hover text-sm font-bold text-white shadow-glow">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-semibold text-white">{user?.name}</span>
            <span className="block truncate text-[11px] text-white/50">{user?.email}</span>
          </span>
          <FiChevronUp size={16} className={cn('shrink-0 text-white/50 transition-transform', profileOpen && 'rotate-180')} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-scope min-h-screen">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <SidebarBody />
      </aside>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 animate-fade-in shadow-card-hover">
            <SidebarBody />
          </div>
        </div>
      )}

      {/* Contenu */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line/70 bg-white/70 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-primary-900/70 sm:px-6">
          <button
            className="grid h-10 w-10 place-items-center rounded-xl text-primary transition hover:bg-surface dark:text-white dark:hover:bg-white/10 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <div className="leading-tight">
            <h1 className="text-base font-extrabold tracking-tight text-primary dark:text-white sm:text-lg">{pageTitle}</h1>
            <p className="hidden text-[11px] font-medium text-muted sm:block">Espace administrateur</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="grid h-10 w-10 place-items-center rounded-xl text-muted transition hover:bg-surface hover:text-primary dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label={isDark ? 'Passer en clair' : 'Passer en sombre'}
            >
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <NotificationBell variant="onLight" />
          </div>
        </header>

        <main className="mx-auto max-w-7xl animate-fade-in p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
