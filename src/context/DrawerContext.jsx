import { createContext, useContext, useState, useCallback, useRef } from 'react';
import SideDrawer from '@/components/ui/SideDrawer';
import CartDrawer from '@/components/drawers/CartDrawer';
import FavoritesDrawer from '@/components/drawers/FavoritesDrawer';
import OrdersDrawer from '@/components/drawers/OrdersDrawer';

const DrawerContext = createContext(null);
export const useDrawer = () => useContext(DrawerContext);

const TITLES = { cart: 'Mon panier', favorites: 'Mes favoris', orders: 'Mes commandes' };

/**
 * Fournit un tiroir latéral global (panier, favoris, commandes) ouvrable partout.
 */
export function DrawerProvider({ children }) {
  const [active, setActive] = useState(null); // 'cart' | 'favorites' | 'orders'
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  const openDrawer = useCallback((type) => {
    if (timer.current) clearTimeout(timer.current);
    setActive(type);
    setOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setOpen(false);
    timer.current = setTimeout(() => setActive(null), 300); // garde le contenu pendant l'animation de sortie
  }, []);

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer, active: open ? active : null }}>
      {children}
      <SideDrawer open={open} onClose={closeDrawer} title={active ? TITLES[active] : ''}>
        {active === 'cart' && <CartDrawer onClose={closeDrawer} />}
        {active === 'favorites' && <FavoritesDrawer onClose={closeDrawer} />}
        {active === 'orders' && <OrdersDrawer onClose={closeDrawer} open={open} />}
      </SideDrawer>
    </DrawerContext.Provider>
  );
}
