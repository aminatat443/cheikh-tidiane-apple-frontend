import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { useDebounce } from '@/hooks/useDebounce';
import { formatPrice } from '@/utils/format';

/**
 * Recherche en temps réel : suggestions instantanées (debounce 250 ms).
 * @param {boolean} autoFocus  focalise le champ à l'affichage (mode révélé)
 * @param {Function} onSubmitted appelé après une navigation (pour refermer le panneau)
 */
export default function SearchBar({ autoFocus = false, onSubmitted }) {
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(term, 250);
  const navigate = useNavigate();
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  const { data, isFetching } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => productService.list({ q: debounced, limit: 6 }),
    enabled: debounced.trim().length >= 2,
  });

  const results = data?.data || [];

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Ferme la liste de suggestions au clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const go = (path) => {
    navigate(path);
    setOpen(false);
    onSubmitted?.();
  };

  const submit = (e) => {
    e.preventDefault();
    if (term.trim()) go(`/search?q=${encodeURIComponent(term.trim())}`);
  };

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={submit} className="relative">
        <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          type="search"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un iPhone, iPad, MacBook…"
          className="input rounded-full pl-10 pr-9"
          aria-label="Rechercher un produit"
        />
        {term && (
          <button
            type="button"
            onClick={() => setTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
            aria-label="Effacer"
          >
            <FiX />
          </button>
        )}
      </form>

      {open && debounced.trim().length >= 2 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-line bg-white text-primary shadow-card-hover">
          {isFetching && <p className="px-4 py-3 text-sm text-muted">Recherche…</p>}
          {!isFetching && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted">Aucun résultat pour « {debounced} »</p>
          )}
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => go(`/products/${p.id}`)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-surface"
            >
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-surface">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <FiSearch className="text-muted" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-accent">{formatPrice(p.price)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
