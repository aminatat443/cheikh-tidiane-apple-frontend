import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function Profile() {
  const user = useSelector((s) => s.auth.user);

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-extrabold">Mon profil</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="card p-6 md:col-span-2">
          <h2 className="font-bold">Informations</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Nom</dt><dd className="font-medium">{user?.name}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Email</dt><dd className="font-medium">{user?.email}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Téléphone</dt><dd className="font-medium">{user?.phone || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">KYC Lebalma</dt><dd className="font-medium">{user?.isKycVerified ? 'Vérifié ✅' : 'Non vérifié'}</dd></div>
          </dl>
        </div>
        <div className="card p-6">
          <h2 className="font-bold">Raccourcis</h2>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link to="/orders" className="text-accent hover:underline">Mes commandes</Link>
            <Link to="/favorites" className="text-accent hover:underline">Mes favoris</Link>
            <Link to="/lebalma" className="text-accent hover:underline">Mes contrats Lebalma</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
