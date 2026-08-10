import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * Hero avec slider d'affiches (nouveautés, promos, Lebalma).
 * Défilement automatique + navigation manuelle.
 *
 * 👉 AFFICHES PHOTO : déposez vos images dans `public/hero/` puis renseignez
 *    le champ `image` de chaque slide (ex. image: '/hero/slider-1.jpg').
 *    - Slide AVEC image  → affiche pleine cliquable, sans texte ni voile.
 *    - Slide SANS image  → dégradé de secours + texte.
 *    Taille recommandée : 2400 × 900 px (ratio 8:3), WebP/JPG, < 400 Ko.
 */
const SLIDES = [
  {
    image: '/hero/slider-1-desktop.png',
    imageTablet: '/hero/slider-1-tablette.png',
    imageMobile: '/hero/slider-1-mobile.png',
    eyebrow: 'Nouveautés',
    title: 'Les derniers iPhone,\nsublimés.',
    subtitle: "De l'iPhone XR au tout dernier modèle. Design, puissance et élégance à portée de main.",
    cta: 'Découvrir les iPhone',
    to: '/products?category=iphone',
    bg: 'from-primary-950 via-primary to-primary-800',
    glow: 'bg-accent/30',
  },
  {
    // Slider 2 (Lebalma) : versions dédiées selon la taille d'écran
    image: '/hero/slider-2-desktop.png',
    imageTablet: '/hero/slider-2-tablette.png',
    imageMobile: '/hero/slider-2-mobile.png',
    eyebrow: 'Financement Lebalma',
    title: 'Payez en\nplusieurs fois.',
    subtitle: "À partir de l'iPhone 11 Pro. Réglez par Wave, Orange Money ou carte bancaire, en toute sérénité.",
    cta: 'Comment ça marche',
    to: '/lebalma',
    bg: 'from-primary via-accent-dark to-accent',
    glow: 'bg-accent/40',
  },
  {
    image: '/hero/slider-3-desktop.png',
    imageTablet: '/hero/slider-3-tablette.png',
    imageMobile: '/hero/slider-3-mobile.png',
    eyebrow: 'Offres limitées',
    title: 'Promotions\nexclusives.',
    subtitle: "Des prix qui font la différence sur une sélection de produits Apple. Le moment idéal.",
    cta: 'Voir les promos',
    to: '/products?isPromo=true',
    bg: 'from-accent-dark via-[#0b3a66] to-accent',
    glow: 'bg-accent/40',
  },
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[index];
  const isImage = Boolean(slide.image);

  return (
    <section className="container-page pt-4 sm:pt-6">
      {/* Ratio adapté : portrait sur mobile, 16/9 tablette, panoramique desktop */}
      <div className="relative isolate aspect-[4/5] overflow-hidden rounded-2xl text-white sm:aspect-[16/9] sm:rounded-3xl lg:aspect-[8/3]">
        {isImage ? (
          /* Slide AVEC affiche : image pleine cliquable + bouton d'action visible */
          <>
            {/* Image non cliquable — seul le bouton l'est */}
            <picture>
              {slide.imageMobile && <source media="(max-width: 639px)" srcSet={slide.imageMobile} />}
              {slide.imageTablet && <source media="(max-width: 1023px)" srcSet={slide.imageTablet} />}
              <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </picture>
            {/* Voile bas discret pour la lisibilité du bouton */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/45 to-transparent" />
            <Link
              to={slide.to}
              className="btn-light group absolute bottom-6 left-7 z-10 sm:bottom-7 sm:left-16"
            >
              {slide.cta}
              <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </>
        ) : (
          /* Slide SANS image : dégradé + texte */
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg} transition-[background] duration-1000`} />
            <div className="pointer-events-none absolute inset-0 bg-grid-line bg-[size:44px_44px] opacity-40" />
            <div className={`pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full blur-3xl ${slide.glow}`} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/25 to-transparent" />

            <div className="relative flex h-full flex-col justify-center px-7 py-12 sm:px-16">
              <div key={index} className="max-w-2xl">
                <span className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 ring-1 ring-white/15 backdrop-blur">
                  {slide.eyebrow}
                </span>
                <h1 className="animate-fade-up mt-5 whitespace-pre-line text-4xl font-extrabold leading-[1.02] tracking-tightest sm:text-6xl" style={{ animationDelay: '60ms' }}>
                  {slide.title}
                </h1>
                <p className="animate-fade-up mt-5 max-w-lg text-base text-white/75 sm:text-lg" style={{ animationDelay: '120ms' }}>
                  {slide.subtitle}
                </p>
                <div className="animate-fade-up mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: '180ms' }}>
                  <Link to={slide.to} className="btn-light group">
                    {slide.cta}
                    <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link to="/products" className="btn text-white ring-1 ring-white/25 hover:bg-white/10">
                    Tout le catalogue
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Flèches de navigation ultra-modernes (verre dépoli) */}
        <button
          onClick={() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
          aria-label="Affiche précédente"
          className="absolute left-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/25 backdrop-blur-md transition duration-300 hover:scale-110 hover:bg-white/20 active:scale-95 sm:h-11 sm:w-11 lg:left-5"
        >
          <FiChevronLeft size={22} />
        </button>
        <button
          onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
          aria-label="Affiche suivante"
          className="absolute right-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/25 backdrop-blur-md transition duration-300 hover:scale-110 hover:bg-white/20 active:scale-95 sm:h-11 sm:w-11 lg:right-5"
        >
          <FiChevronRight size={22} />
        </button>

        {/* Indicateurs (à droite pour ne pas chevaucher le bouton d'action) */}
        <div className="absolute bottom-6 right-7 z-10 flex gap-2 sm:right-16">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Affiche ${i + 1}`}
              className={`h-1.5 rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.5)] transition-all duration-500 ${
                i === index ? 'w-9 bg-white' : 'w-4 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>

    </section>
  );
}
