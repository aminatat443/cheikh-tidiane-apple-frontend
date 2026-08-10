import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiEdit3 } from 'react-icons/fi';
import ReviewCard from '@/components/common/ReviewCard';
import FeedbackModal from '@/components/common/FeedbackModal';
import { STATIC_REVIEWS } from '@/components/common/staticReviews';
import { feedbackService } from '@/services/feedback.service';

export default function Avis() {
  const { data } = useQuery({ queryKey: ['feedback'], queryFn: () => feedbackService.list() });
  const dynamic = (data?.data || []).map((f) => ({ name: f.name, role: f.role || 'Client', rating: f.rating, text: f.comment }));
  const all = [...dynamic, ...STATIC_REVIEWS];
  const [open, setOpen] = useState(false);

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Avis clients</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tighter dark:text-white sm:text-4xl">Ils nous font confiance</h1>
          <p className="mt-1 text-sm text-muted">{all.length} avis</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary">
          <FiEdit3 size={16} /> Donner mon avis
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {all.map((r, i) => <ReviewCard key={`${r.name}-${i}`} {...r} />)}
      </div>

      <FeedbackModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
