import { FaQuoteLeft } from 'react-icons/fa';
import Rating from '@/components/ui/Rating';

/** Carte d'avis client (témoignage). */
export default function ReviewCard({ name, role, rating, text }) {
  return (
    <figure className="relative flex flex-col rounded-2xl bg-white p-7 shadow-card ring-1 ring-line/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover dark:bg-primary-800 dark:ring-white/10">
      <FaQuoteLeft className="text-accent/25" size={26} />
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-primary-800 dark:text-white/80">{text}</blockquote>
      <div className="mt-5"><Rating value={rating} /></div>
      <figcaption className="mt-4 flex items-center gap-3 border-t border-line pt-4 dark:border-white/10">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-white dark:bg-white/10">
          {name.charAt(0).toUpperCase()}
        </span>
        <span>
          <span className="block text-sm font-semibold text-primary dark:text-white">{name}</span>
          <span className="block text-xs text-muted">{role}</span>
        </span>
      </figcaption>
    </figure>
  );
}
