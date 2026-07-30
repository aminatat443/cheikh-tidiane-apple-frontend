import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiSmartphone, FiCreditCard, FiPackage, FiCalendar } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Reveal from '@/components/common/Reveal';
import { formatPrice } from '@/utils/format';
import { WHATSAPP_NUMBER } from '@/constants';

const PLANS = [
  {
    title: 'iPhone 11 · 12 · 13',
    months: 3,
    down: 40,
    mult: '1,6',
    desc: 'Un acompte de 40 %, puis le solde en 3 mensualités.',
  },
  {
    title: 'iPhone 14 · 16 · 17',
    months: 6,
    down: 60,
    mult: '1,7',
    desc: 'Un acompte de 60 %, puis le solde en 6 mensualités.',
  },
];

const STEPS = [
  { icon: FiSmartphone, t: 'Choisissez votre iPhone', d: 'Parmi les modèles éligibles (à partir de l’iPhone 11), sélectionnez la version et la capacité.' },
  { icon: FiCreditCard, t: 'Réglez l’acompte', d: 'Un pourcentage du prix (40 % ou 60 % selon le modèle) via Wave, Orange Money ou carte.' },
  { icon: FiPackage, t: 'Recevez votre appareil', d: 'Votre téléphone vous est remis immédiatement, dès l’acompte payé.' },
  { icon: FiCalendar, t: 'Payez à votre rythme', d: 'Le reste en mensualités fixes (3 ou 6 mois selon le modèle).' },
];

// Exemple : iPhone 14 Simple 128 Go
const EX_PRICE = 220000;
const EX_DOWN = Math.round(EX_PRICE * 0.6);
const EX_MONTHLY = Math.round(((EX_PRICE - EX_DOWN) * 1.7) / 6);

export default function Lebalma() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'Bonjour, je souhaite des informations sur le financement Lebalma.'
  )}`;

  return (
    <div className="container-page py-8 sm:py-10">
      {/* En-tête */}
      <section className="relative isolate overflow-hidden rounded-3xl bg-primary px-7 py-16 text-white sm:px-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-grid-line bg-[size:44px_44px] opacity-25" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent/25 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="eyebrow">Financement</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tightest sm:text-6xl">Lebalma</h1>
          <p className="mt-5 max-w-lg text-lg text-white/75">
            Achetez votre iPhone et payez en plusieurs fois. Un acompte, votre appareil tout de
            suite, le reste à votre rythme.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/products?lebalma=true" className="btn-light group">
              Voir les produits éligibles
              <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn text-white ring-1 ring-white/25 hover:bg-white/10">
              <FaWhatsapp /> Nous contacter
            </a>
          </div>
        </div>
      </section>

      {/* Les deux formules */}
      <Reveal as="section" className="mt-16">
        <div className="text-center">
          <p className="eyebrow">Les formules</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tighter dark:text-white sm:text-3xl">
            Deux plans selon votre modèle
          </h2>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {PLANS.map((p) => (
            <div key={p.title} className="card p-8">
              <h3 className="text-xl font-extrabold dark:text-white">{p.title}</h3>
              <p className="mt-2 text-sm text-muted">{p.desc}</p>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-surface py-4 dark:bg-primary-900">
                  <p className="text-2xl font-extrabold text-accent">{p.down}%</p>
                  <p className="mt-1 text-xs text-muted">Acompte</p>
                </div>
                <div className="rounded-xl bg-surface py-4 dark:bg-primary-900">
                  <p className="text-2xl font-extrabold dark:text-white">{p.months}</p>
                  <p className="mt-1 text-xs text-muted">Mensualités</p>
                </div>
                <div className="rounded-xl bg-surface py-4 dark:bg-primary-900">
                  <p className="text-2xl font-extrabold dark:text-white">×{p.mult}</p>
                  <p className="mt-1 text-xs text-muted">sur le reste</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted">
          Mensualité = (prix − acompte) × multiplicateur ÷ nombre de mois.
        </p>
      </Reveal>

      {/* Comment ça marche */}
      <Reveal as="section" className="mt-20">
        <div className="text-center">
          <p className="eyebrow">Étapes</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tighter dark:text-white sm:text-3xl">
            Comment ça marche ?
          </h2>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, t, d }, i) => (
            <div key={t} className="card p-6">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-accent/10 text-accent">
                  <Icon size={20} />
                </span>
                <span className="text-3xl font-extrabold text-primary-200 dark:text-white/10">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-4 font-bold dark:text-white">{t}</h3>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Exemple chiffré */}
      <Reveal as="section" className="mt-20">
        <div className="overflow-hidden rounded-3xl bg-surface ring-1 ring-line dark:bg-primary-800 dark:ring-white/10">
          <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow">Exemple</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tighter dark:text-white sm:text-3xl">
                iPhone 14 Simple · 128 Go
              </h2>
              <p className="mt-3 text-muted">
                Prix {formatPrice(EX_PRICE)}. Vous réglez {formatPrice(EX_DOWN)} d’acompte (60 %),
                puis 6 mensualités de <span className="font-semibold text-accent">{formatPrice(EX_MONTHLY)}</span>.
              </p>
              <Link to="/products?lebalma=true" className="btn-primary mt-6">
                Choisir mon iPhone <FiArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white p-5 text-center ring-1 ring-line dark:bg-primary-900 dark:ring-white/10">
                <p className="text-xs text-muted">Acompte (60 %)</p>
                <p className="mt-1 text-xl font-extrabold dark:text-white">{formatPrice(EX_DOWN)}</p>
              </div>
              <div className="rounded-2xl bg-white p-5 text-center ring-1 ring-line dark:bg-primary-900 dark:ring-white/10">
                <p className="text-xs text-muted">Mensualité</p>
                <p className="mt-1 text-xl font-extrabold text-accent">{formatPrice(EX_MONTHLY)}</p>
              </div>
              <div className="col-span-2 rounded-2xl bg-white p-5 text-center ring-1 ring-line dark:bg-primary-900 dark:ring-white/10">
                <p className="text-xs text-muted">Durée</p>
                <p className="mt-1 text-xl font-extrabold dark:text-white">6 mois</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Moyens de paiement + note */}
      <Reveal as="section" className="mt-20">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="eyebrow">Paiement</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Wave', 'Orange Money', 'Visa', 'Mastercard'].map((m) => (
              <span key={m} className="chip"><FiCheck className="text-accent" size={13} /> {m}</span>
            ))}
          </div>
          <p className="mx-auto mt-4 max-w-2xl rounded-2xl bg-surface p-4 text-xs text-muted dark:bg-primary-800">
            L’appareil est remis dès l’acompte payé. Les conditions exactes (acompte, durée,
            éligibilité) sont confirmées au moment de la souscription. Une pièce d’identité est requise.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
