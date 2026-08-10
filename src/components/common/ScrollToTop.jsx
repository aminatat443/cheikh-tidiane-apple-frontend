import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Remet le défilement tout en haut à CHAQUE changement de route.
 * Robuste : neutralise le smooth, scrolle window + <html> + <body>, et relance
 * après le rendu (contenu chargé de façon asynchrone).
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto'; // saut instantané (annule le smooth global)

    const toTop = () => {
      window.scrollTo(0, 0);
      html.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };

    toTop();
    const raf = requestAnimationFrame(() => {
      toTop();
      html.style.scrollBehavior = prev;
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
