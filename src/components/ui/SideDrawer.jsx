import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { cn } from '@/utils/format';

/**
 * Tiroir latéral qui glisse depuis la droite (mini-panier, favoris, commandes…).
 * Toujours monté pour animer l'ouverture/fermeture ; masqué (translate-x) sinon.
 */
export default function SideDrawer({ open, onClose, title, children, width = 'max-w-md', side = 'right' }) {
  const isLeft = side === 'left';
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return createPortal(
    <div className={cn('fixed inset-0 z-[80]', open ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!open}>
      {/* Fond */}
      <div
        onClick={onClose}
        className={cn('absolute inset-0 bg-primary/40 backdrop-blur-sm transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')}
      />
      {/* Panneau */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'absolute top-0 flex h-full w-full flex-col bg-white shadow-card-hover transition-transform duration-300 ease-smooth dark:bg-primary-900',
          isLeft ? 'left-0' : 'right-0',
          width,
          open ? 'translate-x-0' : isLeft ? '-translate-x-full' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4 dark:border-white/10">
          <h2 className="text-lg font-extrabold tracking-tight dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-primary dark:hover:bg-white/10 dark:hover:text-white"
          >
            <FiX size={18} />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>,
    document.body
  );
}

/** État vide réutilisable pour les tiroirs. */
export function DrawerEmpty({ icon: Icon, title, desc, cta, onCta }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <span className="mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-line text-muted dark:border-white/10">
        <Icon size={26} />
      </span>
      <h3 className="text-lg font-extrabold tracking-tight dark:text-white">{title}</h3>
      {desc && <p className="mt-1.5 max-w-xs text-sm text-muted">{desc}</p>}
      {cta && (
        <button onClick={onCta} className="btn-primary mt-6">
          {cta}
        </button>
      )}
    </div>
  );
}
