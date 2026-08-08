import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiHeart, FiShoppingBag, FiUser, FiMenu, FiX, FiLogOut,
  FiSearch, FiMoon, FiSun, FiChevronDown,
} from 'react-icons/fi';
import SearchBar from '@/components/common/SearchBar';
import NotificationBell from '@/components/common/NotificationBell';
import SideDrawer from '@/components/ui/SideDrawer';
import { useAuthModal } from '@/context/AuthModalContext';
import { useDrawer } from '@/context/DrawerContext';
import { useTheme } from '@/hooks/useTheme';
import { selectCartCount } from '@/store/cartSlice';
import { selectFavoriteCount } from '@/store/favoriteSlice';
import { logout } from '@/store/authSlice';
import { CATEGORIES } from '@/constants';
import { cn } from '@/utils/format';
import { isAdmin } from '@/utils/roles';

const navLinks = [
  { label: 'Accueil', to: '/' },
  ...CATEGORIES.map((c) => ({ label: c.label, to: `/products?category=${c.slug}` })),
  { label: 'Lebalma', to: '/lebalma' },
  { label: 'Promos', to: '/products?isPromo=true' },
];

// Navbar noir profond : icônes claires
const iconBtnCls =
  'relative grid h-10 w-10 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dispatch = useDispatch();
  const { isDark, toggle: toggleTheme } = useTheme();
  const cartCount = useSelector(selectCartCount);
  const favCount = useSelector(selectFavoriteCount);
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { openAuth } = useAuthModal();
  const { openDrawer } = useDrawer();
  const location = useLocation();
  const navigate = useNavigate();
  const admin = isAdmin(user);

  const onLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isLinkActive = (to) => {
    const [path, query = ''] = to.split('?');
    if (location.pathname !== path) return false;
    if (!query) return true;
    const current = new URLSearchParams(location.search);
    for (const [k, v] of new URLSearchParams(query)) {
      if (current.get(k) !== v) return false;
    }
    return true;
  };

  useEffect(() => {
    if (!searchOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setSearchOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen]);

  const CountIcon = ({ to, onClick, icon: Icon, count, label }) => {
    const inner = (
      <>
        <Icon size={19} />
        {count > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white ring-2 ring-primary">
            {count}
          </span>
        )}
      </>
    );
    return onClick ? (
      <button onClick={onClick} className={iconBtnCls} aria-label={label}>{inner}</button>
    ) : (
      <Link to={to} className={iconBtnCls} aria-label={label}>{inner}</Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 text-white">
      <div className="border-b border-white/10 bg-primary">
        {searchOpen ? (
          /* Mode recherche : rangée dédiée (mobile & desktop) */
          <div className="container-page flex h-16 items-center gap-3">
            <BrandLogo />
            <div className="min-w-0 flex-1 animate-fade-in">
              <SearchBar autoFocus onSubmitted={() => setSearchOpen(false)} />
            </div>
            <button onClick={() => setSearchOpen(false)} className={iconBtnCls} aria-label="Fermer la recherche">
              <FiX size={20} />
            </button>
          </div>
        ) : (
          <div className="container-page flex h-16 items-center gap-3">
            {/* GAUCHE — mobile : menu + recherche · desktop : logo */}
            <div className="flex shrink-0 items-center gap-0.5">
              <button className={cn(iconBtnCls, 'lg:hidden')} onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
                {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
              <button className={cn(iconBtnCls, 'lg:hidden')} onClick={() => setSearchOpen(true)} aria-label="Rechercher">
                <FiSearch size={20} />
              </button>
              <div className="hidden lg:flex">
                <BrandLogo />
              </div>
            </div>

            {/* CENTRE — zone flex-1 : nav centrée dedans → jamais collée aux actions */}
            <div className="flex min-w-0 flex-1 items-center justify-center">
              <div className="lg:hidden">
                <BrandLogo />
              </div>
              <nav className="hidden h-16 items-center gap-1 lg:flex">
                {navLinks.map((l) => (
                  <Link
                    key={l.label}
                    to={l.to}
                    className={cn(
                      'relative flex h-full items-center whitespace-nowrap px-3 text-sm font-medium transition-colors',
                      'after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300',
                      isLinkActive(l.to) ? 'text-accent after:scale-x-100' : 'text-white/80 hover:text-white'
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* DROITE — desktop : toutes les actions · mobile : compte + panier */}
            <div className="flex shrink-0 items-center justify-end gap-0.5">
              {/* Desktop */}
              <div className="hidden items-center gap-0.5 lg:flex">
                <button onClick={() => setSearchOpen(true)} className={iconBtnCls} aria-label="Rechercher">
                  <FiSearch size={19} />
                </button>
                <button onClick={toggleTheme} className={iconBtnCls} aria-label={isDark ? 'Passer en clair' : 'Passer en sombre'}>
                  {isDark ? <FiSun size={19} /> : <FiMoon size={19} />}
                </button>
                {!admin && <CountIcon onClick={() => openDrawer('favorites')} icon={FiHeart} count={favCount} label="Favoris" />}
                <CountIcon onClick={() => openDrawer('cart')} icon={FiShoppingBag} count={cartCount} label="Panier" />
                {isAuthenticated && <NotificationBell variant="onDark" />}

                {isAuthenticated ? (
                  <div className="group relative ml-1">
                    <button className="flex h-10 items-center gap-1.5 rounded-full pl-1 pr-2 text-sm font-medium text-white/80 transition hover:bg-white/10">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-xs font-bold text-primary">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                      <span className="hidden max-w-[110px] truncate xl:block">{user?.name}</span>
                      <FiChevronDown size={15} className="transition-transform group-hover:rotate-180" />
                    </button>
                    <div className="invisible absolute right-0 top-full w-56 origin-top-right translate-y-1 rounded-2xl border border-line bg-white p-2 text-primary opacity-0 shadow-card-hover transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-white/10 dark:bg-primary-800 dark:text-white">
                      <div className="px-3 py-2">
                        <p className="text-sm font-semibold">{user?.name}</p>
                        <p className="truncate text-xs text-muted">{user?.email}</p>
                      </div>
                      <div className="my-1 h-px bg-line dark:bg-white/10" />
                      <Link to="/profile" className="block rounded-lg px-3 py-2 text-sm text-primary-700 hover:bg-surface dark:text-white/80 dark:hover:bg-white/5">Mon profil</Link>
                      {!admin && (
                        <>
                          <button onClick={() => openDrawer('orders')} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-primary-700 hover:bg-surface dark:text-white/80 dark:hover:bg-white/5">Mes commandes</button>
                          <Link to="/returns" className="block rounded-lg px-3 py-2 text-sm text-primary-700 hover:bg-surface dark:text-white/80 dark:hover:bg-white/5">Mes retours</Link>
                          <Link to="/mes-financements" className="block rounded-lg px-3 py-2 text-sm text-primary-700 hover:bg-surface dark:text-white/80 dark:hover:bg-white/5">Mes Lebalma</Link>
                        </>
                      )}
                      {admin && (
                        <Link to="/admin" className="block rounded-lg px-3 py-2 text-sm font-medium text-accent hover:bg-accent-light dark:hover:bg-white/5">Administration</Link>
                      )}
                      <div className="my-1 h-px bg-line dark:bg-white/10" />
                      <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-surface dark:hover:bg-white/5">
                        <FiLogOut size={15} /> Déconnexion
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => openAuth('login')} className="btn-light ml-1 h-10 px-5 py-0 text-[13px]">
                    Se connecter
                  </button>
                )}
              </div>

              {/* Mobile : favoris + compte + panier */}
              <div className="flex items-center gap-0.5 lg:hidden">
                {!admin && <CountIcon onClick={() => openDrawer('favorites')} icon={FiHeart} count={favCount} label="Favoris" />}
                <button
                  onClick={() => (isAuthenticated ? navigate('/profile') : openAuth('login'))}
                  className={iconBtnCls}
                  aria-label="Mon compte"
                >
                  <FiUser size={20} />
                </button>
                <CountIcon onClick={() => openDrawer('cart')} icon={FiShoppingBag} count={cartCount} label="Panier" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Menu mobile — tiroir latéral (glisse depuis la gauche) */}
      <SideDrawer open={mobileOpen && !searchOpen} onClose={() => setMobileOpen(false)} title="Menu" side="left" width="max-w-xs">
        <nav className="flex flex-1 flex-col overflow-y-auto p-3">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                isLinkActive(l.to) ? 'bg-accent-light text-accent' : 'text-primary-700 hover:bg-surface dark:text-white/80 dark:hover:bg-white/5'
              )}
            >
              {l.label}
            </Link>
          ))}

          <div className="my-2 h-px bg-line dark:bg-white/10" />

          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-primary-700 transition hover:bg-surface dark:text-white/80 dark:hover:bg-white/5">Mon profil</Link>
              {!admin && (
                <>
                  <button onClick={() => { setMobileOpen(false); openDrawer('orders'); }} className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-primary-700 transition hover:bg-surface dark:text-white/80 dark:hover:bg-white/5">Mes commandes</button>
                  <button onClick={() => { setMobileOpen(false); openDrawer('favorites'); }} className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-primary-700 transition hover:bg-surface dark:text-white/80 dark:hover:bg-white/5">Mes favoris</button>
                </>
              )}
              {admin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-accent transition hover:bg-accent-light dark:hover:bg-white/5">Administration</Link>
              )}
              <button onClick={() => { setMobileOpen(false); onLogout(); }} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-danger transition hover:bg-danger/10">
                <FiLogOut size={15} /> Déconnexion
              </button>
            </>
          ) : (
            <button onClick={() => { setMobileOpen(false); openAuth('login'); }} className="btn-primary mt-1 w-full">
              Se connecter
            </button>
          )}

          <div className="my-2 h-px bg-line dark:bg-white/10" />

          <button onClick={toggleTheme} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-surface hover:text-primary dark:hover:bg-white/5 dark:hover:text-white">
            {isDark ? <FiSun size={16} /> : <FiMoon size={16} />} {isDark ? 'Mode clair' : 'Mode sombre'}
          </button>
        </nav>
      </SideDrawer>
    </header>
  );
}

function BrandLogo() {
  return (
    <Link to="/" className="flex shrink-0 items-center" aria-label="Cheikh Tidiane — Accueil">
      <img src="/images/logo_cta.svg" alt="Cheikh Tidiane" className="h-9 w-auto sm:h-10" />
    </Link>
  );
}
