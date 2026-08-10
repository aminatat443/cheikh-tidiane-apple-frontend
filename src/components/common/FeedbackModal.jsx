import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { FaStar, FaRegStar } from 'react-icons/fa';
import Modal from '@/components/ui/Modal';
import { feedbackService } from '@/services/feedback.service';

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

/** Modale « Donner mon avis sur la boutique » (réutilisable). */
export default function FeedbackModal({ open, onClose }) {
  const qc = useQueryClient();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', rating: 5, comment: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  // Réinitialise à chaque ouverture
  useEffect(() => {
    if (open) { setDone(false); setError(''); }
  }, [open]);

  async function submit(e) {
    e.preventDefault();
    const name = isAuthenticated ? (user?.name || '') : form.name.trim();
    const role = isAuthenticated ? (user?.city || '') : form.role.trim();
    if (!name || !form.comment.trim()) {
      return setError(isAuthenticated ? 'Un commentaire est requis.' : 'Nom et commentaire requis.');
    }
    setBusy(true);
    setError('');
    try {
      await feedbackService.create({ name, role, rating: form.rating, comment: form.comment.trim() });
      qc.invalidateQueries({ queryKey: ['feedback'] });
      setForm({ name: '', role: '', rating: 5, comment: '' });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Envoi impossible.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Donner mon avis sur la boutique" size="sm">
      {done ? (
        <div className="py-6 text-center">
          <p className="text-lg font-extrabold dark:text-white">Merci pour votre avis ! 🙏</p>
          <p className="mt-1 text-sm text-muted">Votre retour compte beaucoup pour nous.</p>
          <button onClick={onClose} className="btn-primary mt-5">Fermer</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {isAuthenticated ? (
            <p className="rounded-xl bg-surface px-3 py-2 text-sm text-muted dark:bg-primary-800">
              Publié en tant que <span className="font-semibold text-primary dark:text-white">{user?.name}</span>
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Votre nom" value={form.name} onChange={(e) => set({ name: e.target.value })} />
              <input className="input" placeholder="Ville (optionnel)" value={form.role} onChange={(e) => set({ role: e.target.value })} />
            </div>
          )}
          <div>
            <label className="label dark:text-white/80">Votre note</label>
            <StarInput value={form.rating} onChange={(v) => set({ rating: v })} />
          </div>
          <textarea
            className="input resize-none"
            rows={4}
            placeholder="Partagez votre expérience avec la boutique…"
            value={form.comment}
            onChange={(e) => set({ comment: e.target.value })}
          />
          {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-outline">Annuler</button>
            <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Envoi…' : 'Publier mon avis'}</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
