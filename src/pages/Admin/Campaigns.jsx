import { FiMail, FiZap, FiCheckCircle, FiTruck, FiPackage } from 'react-icons/fi';
import PageHeader from '@/components/ui/PageHeader';
import CampaignPromo from './CampaignPromo';
import AbandonedCart from './AbandonedCart';
import Recommendations from './Recommendations';

// E-mails transactionnels : déclenchés automatiquement par des événements.
const TRANSACTIONAL = [
  {
    icon: FiCheckCircle,
    title: 'Confirmation de commande',
    desc: 'Envoyé au client dès qu\'une commande est passée.',
    trigger: 'À la commande',
  },
  {
    icon: FiTruck,
    title: 'Commande expédiée',
    desc: 'Envoyé quand une commande passe au statut « expédiée ».',
    trigger: 'Changement de statut',
  },
  {
    icon: FiPackage,
    title: 'Retour en stock',
    desc: 'Prévient les clients inscrits « Prévenez-moi » au réassort d\'un produit.',
    trigger: 'Produit réapprovisionné',
  },
];

/** Étiquette de section (titre + description). */
function SectionLabel({ icon: Icon, title, desc }) {
  return (
    <div className="mt-10 flex items-start gap-3 first:mt-0">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/30 text-primary dark:border-white/30 dark:text-white">
        <Icon size={18} />
      </span>
      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-primary dark:text-white">{title}</h2>
        <p className="text-sm text-muted">{desc}</p>
      </div>
    </div>
  );
}

export default function Campaigns() {
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Campagnes e-mail"
        subtitle="Diffusez vos e-mails marketing et suivez les envois automatiques. Sans SMTP configuré, les envois sont simulés."
      />

      {/* Campagnes marketing — envoi manuel */}
      <SectionLabel
        icon={FiMail}
        title="Campagnes marketing"
        desc="Envoi manuel — prévisualisez, testez, puis diffusez à tous vos clients."
      />
      <CampaignPromo
        type="promo"
        title="Promotions"
        description="E-mail responsive généré à partir de vos produits (offres & remises)."
      />
      <CampaignPromo
        type="newsletter"
        title="Newsletter — Nouveaux arrivages"
        description="Met en avant vos derniers produits et nouveautés."
      />

      {/* Campagnes ciblées — basées sur le comportement */}
      <SectionLabel
        icon={FiZap}
        title="Campagnes ciblées"
        desc="Personnalisées selon le comportement et l'historique d'achat des clients."
      />
      <AbandonedCart />
      <Recommendations />

      {/* E-mails automatiques — transactionnels */}
      <SectionLabel
        icon={FiCheckCircle}
        title="E-mails automatiques"
        desc="Déclenchés par les événements de la boutique — aucune action requise."
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {TRANSACTIONAL.map(({ icon: Icon, title, desc, trigger }) => (
          <div key={title} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-success/40 text-success">
                <Icon size={20} />
              </span>
              <span className="rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-success">
                Automatique
              </span>
            </div>
            <h3 className="mt-3 font-bold text-primary dark:text-white">{title}</h3>
            <p className="mt-1 text-sm text-muted">{desc}</p>
            <p className="mt-3 border-t border-line pt-2 text-xs font-medium text-muted dark:border-white/10">
              Déclencheur : <span className="text-primary dark:text-white">{trigger}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
