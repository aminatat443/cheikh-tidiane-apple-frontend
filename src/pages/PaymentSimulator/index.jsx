import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiShield, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Loader from '@/components/ui/Loader';
import { paymentService } from '@/services/payment.service';
import { formatPrice } from '@/utils/format';
import { PAYMENT_METHOD_LABELS } from '@/constants';

/**
 * Page de simulation de paiement (mode dev, tant qu'aucune passerelle réelle
 * n'est configurée). Elle imite la page hébergée de Wave / Orange Money.
 */
export default function PaymentSimulator() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['payment', id], queryFn: () => paymentService.get(id) });
  const p = data?.data;

  async function decide(outcome) {
    setBusy(true);
    try {
      await paymentService.simulate(id, outcome);
    } catch {
      /* ignore — la page de retour affichera l'état */
    }
    const status = outcome === 'success' ? 'success' : 'error';
    navigate(`/paiement/retour?status=${status}&purpose=${p?.purpose || 'order'}`);
  }

  if (isLoading) return <Loader />;
  if (!p) return <div className="container-page py-20 text-center">Paiement introuvable.</div>;

  return (
    <div className="container-page flex justify-center py-16">
      <div className="card w-full max-w-md p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent-light text-accent">
          <FiShield size={26} />
        </span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">
          Paiement sécurisé · simulation
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight dark:text-white">{formatPrice(p.amount)}</h1>
        <p className="mt-1 text-sm text-muted">
          {PAYMENT_METHOD_LABELS[p.method] || p.method} ·{' '}
          {p.purpose === 'installment' ? 'Échéance Lebalma' : 'Commande'}
        </p>

        <div className="mt-6 rounded-xl bg-surface p-3 text-xs text-muted dark:bg-primary-800">
          Mode démonstration — aucune transaction réelle. Renseignez les clés Wave / Orange Money
          côté serveur pour activer la passerelle réelle.
        </div>

        <div className="mt-6 space-y-3">
          <button onClick={() => decide('success')} disabled={busy} className="btn-buy w-full">
            <FiCheckCircle /> {busy ? 'Traitement…' : `Payer ${formatPrice(p.amount)}`}
          </button>
          <button onClick={() => decide('failure')} disabled={busy} className="btn-outline w-full">
            <FiXCircle /> Simuler un échec
          </button>
        </div>
      </div>
    </div>
  );
}
