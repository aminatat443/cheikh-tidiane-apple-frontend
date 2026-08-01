import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

/** Page de retour après paiement (informative — la confirmation vient du webhook). */
export default function PaymentReturn() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ok = params.get('status') === 'success';
  const purpose = params.get('purpose') || 'order';
  const backLink = purpose === 'installment' ? '/mes-financements' : '/orders';
  const backLabel = purpose === 'installment' ? 'Voir mes Lebalma' : 'Voir mes commandes';

  // Paiement réussi → redirection automatique vers le suivi (échéances / commandes).
  useEffect(() => {
    if (!ok) return undefined;
    const t = setTimeout(() => navigate(backLink, { replace: true }), 2200);
    return () => clearTimeout(t);
  }, [ok, backLink, navigate]);

  return (
    <div className="container-page flex justify-center py-20">
      <div className="card w-full max-w-md p-8 text-center">
        <span className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${ok ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          {ok ? <FiCheckCircle size={34} /> : <FiXCircle size={34} />}
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight dark:text-white">
          {ok ? 'Paiement confirmé' : 'Paiement non abouti'}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {ok
            ? 'Merci ! Votre paiement a bien été enregistré. Redirection en cours…'
            : 'Le paiement a été annulé ou a échoué. Vous pouvez réessayer depuis votre espace.'}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link to={backLink} className="btn-primary w-full">{backLabel}</Link>
          <Link to="/" className="btn-outline w-full">Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}
