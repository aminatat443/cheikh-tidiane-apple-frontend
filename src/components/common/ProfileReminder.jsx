import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiUserCheck, FiX } from 'react-icons/fi';
import { isAdmin } from '@/utils/roles';

/**
 * Bandeau de rappel : invite le client connecté à compléter son profil
 * (téléphone / adresse) pour accélérer ses futures commandes.
 * Masquable pour la session en cours (réapparaît tant que le profil est incomplet).
 */
export default function ProfileReminder() {
  const user = useSelector((s) => s.auth.user);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('profileReminderDismissed') === '1'
  );

  if (!user || isAdmin(user) || dismissed) return null;

  const missing = [];
  if (!user.phone) missing.push('téléphone');
  if (!user.address) missing.push('adresse de livraison');
  if (!missing.length) return null;

  const close = () => {
    sessionStorage.setItem('profileReminderDismissed', '1');
    setDismissed(true);
  };

  return (
    <div className="border-b border-accent/20 bg-accent-light dark:border-white/10 dark:bg-primary-800">
      <div className="container-page flex items-center gap-3 py-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
          <FiUserCheck size={16} />
        </span>
        <p className="flex-1 text-sm text-primary-700 dark:text-white/80">
          Complétez votre profil (<span className="font-semibold">{missing.join(' et ')}</span>) pour commander plus vite.{' '}
          <Link to="/profile" className="font-semibold text-accent hover:underline">
            Compléter mon profil
          </Link>
        </p>
        <button
          onClick={close}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-white/60 hover:text-primary dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Masquer"
        >
          <FiX size={15} />
        </button>
      </div>
    </div>
  );
}
