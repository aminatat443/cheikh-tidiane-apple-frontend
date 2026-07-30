import { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/format';

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Révèle son contenu en fondu + montée au défilement (IntersectionObserver).
 * Respecte prefers-reduced-motion (affiche directement, sans animation).
 * @param {number} delay  délai en ms avant l'apparition
 * @param {string} as     balise à rendre (div par défaut)
 */
export default function Reveal({ children, className, delay = 0, as: Tag = 'div' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(prefersReduced);

  useEffect(() => {
    if (prefersReduced || shown) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <Tag
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        'transition-all duration-700 ease-smooth motion-reduce:transition-none',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
        className
      )}
    >
      {children}
    </Tag>
  );
}
