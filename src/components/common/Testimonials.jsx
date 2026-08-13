import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiEdit3, FiArrowRight } from 'react-icons/fi';
import ReviewCard from './ReviewCard';
import FeedbackModal from './FeedbackModal';
import { STATIC_REVIEWS } from './staticReviews';
import { feedbackService } from '@/services/feedback.service';

export default function Testimonials() {
  const { data } = useQuery({ queryKey: ['feedback'], queryFn: () => feedbackService.list() });
  const dynamic = (data?.data || []).map((f) => ({ name: f.name, role: f.role || 'Client', rating: f.rating, text: f.comment }));
  const items = [...dynamic, ...STATIC_REVIEWS].slice(0, 3);

  const [open, setOpen] = useState(false);

  return (
    <>
      {/* En-tête : titre à gauche, « Donner mon avis » en haut à droite */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Avis clients</p>
          <h2 className="text-2xl font-extrabold tracking-tighter dark:text-white sm:text-3xl">
            Ils nous font confiance
          </h2>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary shrink-0 whitespace-nowrap">
          <FiEdit3 size={16} />
          <span className="hidden sm:inline">Donner mon avis</span>
          <span className="sm:hidden">Mon avis</span>
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {items.map((r, i) => <ReviewCard key={`${r.name}-${i}`} {...r} />)}
      </div>

      <div className="mt-8 flex justify-center">
        <Link to="/avis" className="btn-outline">
          Voir tous les avis <FiArrowRight size={15} />
        </Link>
      </div>

      <FeedbackModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
