import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { FiEdit3 } from 'react-icons/fi';
import Rating from '@/components/ui/Rating';
import Modal from '@/components/ui/Modal';
import { productService } from '@/services/product.service';
import { useAuthModal } from '@/context/AuthModalContext';
import { formatDate } from '@/utils/format';

/** Sélecteur d'étoiles interactif (1 à 5). */
function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="text-warning transition-transform hover:scale-110"
          aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
        >
          {n <= (hover || value) ? <FaStar size={28} /> : <FaRegStar size={28} />}
        </button>
      ))}
    </div>
  );
}

/** Section « Notes & avis » d'un produit : moyenne, liste et dépôt d'avis. */
export default function ProductReviews({ product }) {
  const id = product.id;
  const qc = useQueryClient();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { openAuth } = useAuthModal();

  const { data } = useQuery({ queryKey: ['reviews', id], queryFn: () => productService.reviews(id) });
  const reviews = data?.data || [];

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const openForm = () => {
    if (!isAuthenticated) return openAuth('login');
    setError('');
    setOpen(true);
  };

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await productService.addReview(id, { rating, comment: comment.trim() });
      qc.invalidateQueries({ queryKey: ['reviews', id] });
      qc.invalidateQueries({ queryKey: ['product', String(id)] });
      setOpen(false);
      setComment('');
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de publier l'avis.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Avis clients</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight dark:text-white">Notes &amp; avis</h2>
          <div className="mt-2 flex items-center gap-2">
            <Rating value={product.ratingAvg || 0} />
            <span className="text-sm text-muted">
              {(product.ratingAvg || 0).toFixed(1)} · {product.ratingCount || 0} avis
            </span>
          </div>
        </div>
        <button onClick={openForm} className="btn-primary">
          <FiEdit3 size={16} /> Donner mon avis
        </button>
      </div>

      {reviews.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-white dark:bg-white dark:text-primary">
                  {r.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
                <div>
                  <p className="text-sm font-semibold dark:text-white">{r.user?.name || 'Client'}</p>
                  <p className="text-xs text-muted">{formatDate(r.createdAt)}</p>
                </div>
              </div>
              <div className="mt-3">
                <Rating value={r.rating} />
              </div>
              {r.comment && <p className="mt-2 text-sm leading-relaxed text-primary-700 dark:text-white/80">{r.comment}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-line p-8 text-center dark:border-white/10">
          <p className="text-sm text-muted">Aucun avis pour le moment.</p>
          <button onClick={openForm} className="mt-3 text-sm font-semibold text-accent hover:underline">
            Soyez le premier à donner votre avis
          </button>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Donner mon avis" size="sm">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label dark:text-white/80">Votre note</label>
            <StarInput value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="label dark:text-white/80">Votre commentaire</label>
            <textarea
              className="input resize-none"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience avec ce produit…"
            />
          </div>
          {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setOpen(false)} className="btn-outline">Annuler</button>
            <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Publication…' : 'Publier mon avis'}</button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
