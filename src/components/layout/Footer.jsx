import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';
import { SHOP_LOGO } from '@/constants';

const columns = [
  {
    title: 'Produits',
    links: [
      { label: 'iPhone', to: '/products?category=iphone' },
      { label: 'iPad', to: '/products?category=ipad' },
      { label: 'MacBook', to: '/products?category=macbook' },
      { label: 'Promotions', to: '/products?isPromo=true' },
    ],
  },
  {
    title: 'Aide',
    links: [
      { label: 'Lebalma (financement)', to: '/lebalma' },
      { label: 'Livraison', to: '/contact' },
      { label: 'Retours', to: '/contact' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'À propos',
    links: [
      { label: 'Notre boutique', to: '/' },
      { label: 'CGV', to: '/contact' },
      { label: 'Confidentialité', to: '/contact' },
      { label: 'Mentions légales', to: '/contact' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-primary text-white">
      <div className="container-page grid grid-cols-2 gap-8 py-14 md:grid-cols-5">
        <div className="col-span-2">
          <img src={SHOP_LOGO} alt="Cheikh Tidiane Apple" className="h-14 w-auto" />
          <p className="mt-3 max-w-xs text-sm text-white/60">
            iPhone, iPad et MacBook au meilleur prix. Payez comptant ou en plusieurs fois avec
            Lebalma — Wave, Orange Money, carte bancaire.
          </p>
          <div className="mt-4 flex gap-2 text-accent">
            <a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full bg-white/5 transition hover:bg-white/10"><FiInstagram /></a>
            <a href="#" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full bg-white/5 transition hover:bg-white/10"><FiFacebook /></a>
            <a href="#" aria-label="Twitter" className="grid h-9 w-9 place-items-center rounded-full bg-white/5 transition hover:bg-white/10"><FiTwitter /></a>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold">{col.title}</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Cheikh Tidiane Apple. Tous droits réservés.</p>
          <p className="flex items-center gap-3">
            <span>Paiements :</span>
            <span className="font-semibold text-white/70">Wave</span>
            <span className="font-semibold text-white/70">Orange Money</span>
            <span className="font-semibold text-white/70">Visa</span>
            <span className="font-semibold text-white/70">Mastercard</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
