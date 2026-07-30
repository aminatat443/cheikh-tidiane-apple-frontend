import { FaQuoteLeft } from 'react-icons/fa';
import Rating from '@/components/ui/Rating';

const REVIEWS = [
  { name: 'Awa Diop', role: 'Dakar', rating: 5, text: 'Livraison rapide et téléphone parfaitement conforme. Service au top, je recommande vivement !' },
  { name: 'Modou Sarr', role: 'Client Lebalma', rating: 5, text: "Grâce à Lebalma j'ai pu payer mon iPhone en plusieurs fois, sans stress. Exactement ce qu'il me fallait." },
  { name: 'Fatou Ndiaye', role: 'Thiès', rating: 4, text: 'Produits authentiques et bon accompagnement du service client. Une expérience vraiment agréable.' },
];

export default function Testimonials() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {REVIEWS.map((r) => (
        <figure
          key={r.name}
          className="relative flex flex-col rounded-2xl bg-white p-7 shadow-card ring-1 ring-line/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover dark:bg-primary-800 dark:ring-white/10"
        >
          <FaQuoteLeft className="text-accent/25" size={26} />
          <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-primary-800 dark:text-white/80">
            {r.text}
          </blockquote>
          <div className="mt-5"><Rating value={r.rating} /></div>
          <figcaption className="mt-4 flex items-center gap-3 border-t border-line pt-4 dark:border-white/10">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-white dark:bg-white/10">
              {r.name.charAt(0)}
            </span>
            <span>
              <span className="block text-sm font-semibold text-primary dark:text-white">{r.name}</span>
              <span className="block text-xs text-muted">{r.role}</span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
