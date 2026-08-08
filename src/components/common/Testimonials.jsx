import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FaQuoteLeft, FaStar, FaRegStar } from 'react-icons/fa';
import { FiEdit3 } from 'react-icons/fi';
import Rating from '@/components/ui/Rating';
import Modal from '@/components/ui/Modal';
import { feedbackService } from '@/services/feedback.service';

const STATIC = [
  { name: 'Awa Diop', role: 'Dakar', rating: 5, text: 'Livraison rapide et téléphone parfaitement conforme. Service au top, je recommande vivement !' },
  { name: 'Modou Sarr', role: 'Client Lebalma', rating: 5, text: "Grâce à Lebalma j'ai pu payer mon iPhone en plusieurs fois, sans stress. Exactement ce qu'il me fallait." },
  { name: 'Fatou Ndiaye', role: 'Thiès', rating: 4, text: 'Produits authentiques et bon accompagnement du service client. Une expérience vraiment agréable.' },
];

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
          {n <= (hover || value) ? <FaStar size={26} /> : <FaRegStar size={26} />}
        </button>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['feedback'], queryFn: () => feedbackService.list() });
  const dynamic = (data?.data || []).map((f) => ({ name: f.name, role: f.role || 'Client', rating: f.rating, text: f.comment }));
  const items = [...dynamic, ...STATIC].slice(0, 6);

  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', rating: 5, comment: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) return setError('Nom et commentaire requis.');
    setBusy(true);
    setError('');
    try {
      await feedbackService.create({ name: form.name.trim(), role: form.role.trim(), rating: form.rating, comment: form.comment.trim() });
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
    <>
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((r, i) => (
          <figure
            key={`${r.name}-${i}`}
            className="relative flex flex-col rounded-2xl bg-white p-7 shadow-card ring-1 ring-line/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover dark:bg-primary-800 dark:ring-white/10"
          >
            <FaQuoteLeft className="text-accent/25" size={26} />
            <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-primary-800 dark:text-white/80">{r.text}</blockquote>
            <div className="mt-5"><Rating value={r.rating} /></div>
            <figcaption className="mt-4 flex items-center gap-3 border-t border-line pt-4 dark:border-white/10">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-white dark:bg-white/10">
                {r.name.charAt(0).toUpperCase()}
              </span>
              <span>
                <span className="block text-sm font-semibold text-primary dark:text-white">{r.name}</span>
                <span className="block text-xs text-muted">{r.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button onClick={() => { setDone(false); setOpen(true); }} className="btn-primary">
          <FiEdit3 size={16} /> Donner mon avis
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Donner mon avis sur la boutique" size="sm">
        {done ? (
          <div className="py-6 text-center">
            <p className="text-lg font-extrabold dark:text-white">Merci pour votre avis ! 🙏</p>
            <p className="mt-1 text-sm text-muted">Votre retour compte beaucoup pour nous.</p>
            <button onClick={() => setOpen(false)} className="btn-primary mt-5">Fermer</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Votre nom" value={form.name} onChange={(e) => set({ name: e.target.value })} />
              <input className="input" placeholder="Ville (optionnel)" value={form.role} onChange={(e) => set({ role: e.target.value })} />
            </div>
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
              <button type="button" onClick={() => setOpen(false)} className="btn-outline">Annuler</button>
              <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Envoi…' : 'Publier mon avis'}</button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
