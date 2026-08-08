import { Link } from 'react-router-dom';
import { FiSmartphone, FiTablet, FiMonitor, FiArrowUpRight } from 'react-icons/fi';

const CATS = [
  {
    label: 'iPhone', slug: 'iphone', desc: "De l'iPhone XR au dernier modèle.",
    icon: FiSmartphone, grad: 'from-primary-950 to-primary-700',
  },
  {
    label: 'iPad', slug: 'ipad', desc: 'Puissance et créativité, partout.',
    icon: FiTablet, grad: 'from-accent-dark to-accent',
  },
  {
    label: 'MacBook', slug: 'macbook', desc: 'Le Mac pour tout accomplir.',
    icon: FiMonitor, grad: 'from-primary-800 to-primary-950',
  },
];

/** Vitrine des catégories — grandes cartes épurées façon Apple. */
export default function CategoryShowcase() {
  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {CATS.map(({ label, slug, desc, icon: Icon, grad }) => (
        <Link
          key={slug}
          to={`/products?category=${slug}`}
          className={`group relative isolate flex min-h-[13.5rem] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br ${grad} p-7 text-white shadow-card transition-all duration-500 ease-smooth hover:-translate-y-1.5 hover:shadow-card-hover`}
        >
          <Icon
            className="pointer-events-none absolute -right-6 -top-8 text-white/10 transition-all duration-700 group-hover:scale-110 group-hover:text-white/[0.16]"
            size={150}
          />
          <div className="relative">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">Catégorie</span>
            <h3 className="mt-2 text-3xl font-extrabold tracking-tight">{label}</h3>
            <p className="mt-1.5 max-w-[15rem] text-sm text-white/70">{desc}</p>
          </div>
          <span className="relative inline-flex items-center gap-1.5 text-sm font-semibold">
            Découvrir
            <FiArrowUpRight className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}
