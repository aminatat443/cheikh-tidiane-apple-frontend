import { useEffect, useRef } from 'react';
import { GOOGLE_CLIENT_ID } from '@/constants';

let gisPromise = null;
/** Charge le script Google Identity Services une seule fois. */
function loadGis() {
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Chargement Google impossible'));
    document.head.appendChild(s);
    return undefined;
  });
  return gisPromise;
}

/**
 * Bouton « Continuer avec Google » (Google Identity Services).
 * Masqué si VITE_GOOGLE_CLIENT_ID n'est pas défini.
 */
export default function GoogleButton({ onCredential, text = 'continue_with' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !ref.current) return undefined;
    let cancelled = false;
    loadGis()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id || !ref.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (resp) => resp?.credential && onCredential(resp.credential),
        });
        ref.current.innerHTML = '';
        window.google.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          width: 300,
          text,
          shape: 'pill',
          logo_alignment: 'center',
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [onCredential, text]);

  if (!GOOGLE_CLIENT_ID) return null;
  return <div ref={ref} className="flex min-h-11 justify-center" />;
}
