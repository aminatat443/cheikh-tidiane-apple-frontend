import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import { DrawerEmpty } from '@/components/ui/SideDrawer';
import StatusBadge from '@/components/ui/StatusBadge';
import { orderService } from '@/services/auth.service';
import { formatPrice, formatDate } from '@/utils/format';
import { ORDER_STATUSES } from '@/constants';

const meta = (v) => ORDER_STATUSES.find((s) => s.value === v) || { label: v, tone: 'muted' };

/** Commandes récentes (tiroir latéral). */
export default function OrdersDrawer({ onClose, open }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.list(),
    enabled: !!open && isAuthenticated,
  });
  const orders = data?.data || [];
  const go = (p) => { onClose(); navigate(p); };

  if (!isAuthenticated) {
    return <DrawerEmpty icon={FiPackage} title="Connectez-vous" desc="Connectez-vous pour suivre vos commandes." />;
  }
  if (isLoading) return <div className="grid flex-1 place-items-center text-sm text-muted">Chargement…</div>;
  if (!orders.length) {
    return (
      <DrawerEmpty
        icon={FiPackage}
        title="Aucune commande"
        desc="Vous n'avez pas encore passé de commande."
        cta="Découvrir nos produits"
        onCta={() => go('/products')}
      />
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <ul className="space-y-2">
          {orders.map((o) => {
            const st = meta(o.status);
            return (
              <li key={o.id}>
                <button
                  onClick={() => go('/orders')}
                  className="flex w-full items-center gap-3 rounded-2xl border border-line p-3 text-left transition hover:border-accent dark:border-white/10"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-accent/40 text-accent">
                    <FiPackage size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm font-semibold dark:text-white">#{o.reference}</p>
                    <p className="text-xs text-muted">{formatDate(o.createdAt)} · {formatPrice(o.total)}</p>
                  </div>
                  <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                  <FiChevronRight className="shrink-0 text-muted" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="border-t border-line px-5 py-4 dark:border-white/10">
        <button onClick={() => go('/orders')} className="btn-outline w-full">Voir toutes mes commandes</button>
      </div>
    </>
  );
}
