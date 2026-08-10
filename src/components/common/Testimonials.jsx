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
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((r, i) => <ReviewCard key={`${r.name}-${i}`} {...r} />)}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button onClick={() => setOpen(true)} className="btn-primary">
          <FiEdit3 size={16} /> Donner mon avis
        </button>
        <Link to="/avis" className="btn-outline">
          Voir tous les avis <FiArrowRight size={15} />
        </Link>
      </div>

      <FeedbackModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
