import { useRef, useState, useEffect, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from './ProductCard';

/**
 * Rangée de produits défilable horizontalement. Les flèches n'apparaissent que
 * s'il reste des produits à voir dans la direction concernée.
 */
export default function ProductCarousel({ products = [] }) {
  const ref = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return undefined;
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update, products]);

  if (!products.length) return null;

  const scroll = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  const arrowCls =
    'absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-primary shadow-card ring-1 ring-line transition hover:bg-surface hover:text-accent sm:grid dark:bg-primary-800 dark:text-white dark:ring-white/10';

  return (
    <div className="relative">
      {!atStart && (
        <button type="button" onClick={() => scroll(-1)} aria-label="Précédent" className={`${arrowCls} -left-3 lg:-left-5`}>
          <FiChevronLeft size={18} />
        </button>
      )}
      {!atEnd && (
        <button type="button" onClick={() => scroll(1)} aria-label="Suivant" className={`${arrowCls} -right-3 lg:-right-5`}>
          <FiChevronRight size={18} />
        </button>
      )}

      <div
        ref={ref}
        onScroll={update}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <div key={p.id} className="w-40 shrink-0 snap-start sm:w-52 lg:w-56">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
