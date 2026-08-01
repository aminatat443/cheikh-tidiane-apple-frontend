import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { cn } from '@/utils/format';

/**
 * Boîte de dialogue modale accessible (fermeture Échap + clic sur l'arrière-plan).
 */
export default function Modal({ open, onClose, title, children, size = 'md' }) {
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

  if (!open) return null;

  const widths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' };

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-primary/40 p-4 backdrop-blur-md sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cn(
          'my-8 w-full animate-scale-in overflow-hidden rounded-3xl bg-white shadow-card-hover ring-1 ring-line dark:bg-primary-900 dark:ring-white/10',
          widths[size] || widths.md
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4 dark:border-white/10">
          <h2 className="text-lg font-bold tracking-tight dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-primary dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Fermer"
          >
            <FiX size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
