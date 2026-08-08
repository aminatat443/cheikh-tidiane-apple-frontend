import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

/** Bandeau CTA Lebalma — dégradé premium, sans dépendance à une image. */
export default function LebalmaBand() {
  return (
    <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-primary-950 via-primary to-accent-dark px-7 py-12 text-white sm:px-14 sm:py-16">
      <span className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
      <span className="pointer-events-none absolute inset-0 bg-grid-line bg-[size:44px_44px] opacity-[0.12]" />
      <div className="relative max-w-xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 ring-1 ring-white/15 backdrop-blur">
          Financement Lebalma
        </span>
        <h2 className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl">
          Prenez votre iPhone aujourd'hui,<br className="hidden sm:block" /> payez en plusieurs fois.
        </h2>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/70">
          Un acompte, puis des échéances par Wave, Orange Money ou carte.
          L'appareil est à vous <span className="font-semibold text-white">dès l'acompte versé</span>.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/lebalma" className="btn-light group">
            Comment ça marche
            <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link to="/products?category=iphone" className="btn text-white ring-1 ring-white/25 hover:bg-white/10">
            Voir les iPhone éligibles
          </Link>
        </div>
      </div>
    </div>
  );
}
