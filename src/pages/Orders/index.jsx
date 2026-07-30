import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Loader from '@/components/ui/Loader';
import Badge from '@/components/ui/Badge';
import { orderService } from '@/services/auth.service';
import { formatPrice, formatDate } from '@/utils/format';

const STATUS_LABELS = {
  pending: 'En attente',
  paid: 'Payée',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  returned: 'Retournée',
};

export default function Orders() {
  const { data, isLoading } = useQuery({ queryKey: ['orders'], queryFn: () => orderService.list() });

  if (isLoading) return <Loader />;
  const orders = data?.data || [];

  if (!orders.length) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-extrabold">Aucune commande</h1>
        <Link to="/products" className="btn-primary mt-6 inline-flex">Découvrir nos produits</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-extrabold">Mes commandes</h1>
      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="font-semibold">#{o.reference}</p>
              <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
            </div>
            <Badge tone="soft">{STATUS_LABELS[o.status] || o.status}</Badge>
            <p className="font-bold text-accent">{formatPrice(o.total)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
