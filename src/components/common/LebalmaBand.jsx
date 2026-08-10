import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

/**
 * Bandeau Lebalma = même visuel que le slider 2 du hero, adapté à l'écran.
 * L'image n'est PAS cliquable — seul le bouton l'est.
 */
export default function LebalmaBand() {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-card ring-1 ring-line/60 dark:ring-white/10 sm:aspect-[16/9] sm:rounded-3xl lg:aspect-[8/3]">
      <picture>
        <source media="(max-width: 639px)" srcSet="/hero/slider-2-mobile.png" />
        <source media="(max-width: 1023px)" srcSet="/hero/slider-2-tablette.png" />
        <img src="/hero/slider-2-desktop.png" alt="Financement Lebalma" className="absolute inset-0 h-full w-full object-cover" />
      </picture>

      {/* Voile bas + bouton (seul élément cliquable) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/45 to-transparent" />
      <Link to="/lebalma" className="btn-light group absolute bottom-6 left-7 sm:bottom-7 sm:left-16">
        Comment ça marche
        <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
