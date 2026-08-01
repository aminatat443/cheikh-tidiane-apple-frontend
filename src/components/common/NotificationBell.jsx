import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiBell, FiCheck } from 'react-icons/fi';
import { notificationService } from '@/services/notification.service';
import { timeAgo, cn } from '@/utils/format';

/**
 * Cloche de notifications avec compteur de non-lues et panneau déroulant.
 * @param {'onDark'|'onLight'} variant - couleur de l'icône selon le fond.
 */
export default function NotificationBell({ variant = 'onLight' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.list(),
    refetchInterval: 60_000,
  });

  const items = data?.data || [];
  const unread = data?.meta?.unread ?? items.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const refresh = () => qc.invalidateQueries({ queryKey: ['notifications'] });

  async function openItem(n) {
    setOpen(false);
    if (!n.isRead) {
      try { await notificationService.markRead(n.id); refresh(); } catch { /* silencieux */ }
    }
    if (n.link) navigate(n.link);
  }

  async function markAll() {
    try { await notificationService.markAllRead(); refresh(); } catch { /* silencieux */ }
  }

  const btnCls =
    variant === 'onDark'
      ? 'relative grid h-10 w-10 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white'
      : 'relative grid h-10 w-10 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-primary dark:hover:bg-white/10 dark:hover:text-white';

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className={btnCls} aria-label="Notifications">
        <FiBell size={19} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white ring-2 ring-primary dark:ring-primary-900">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl bg-white text-primary shadow-card-hover ring-1 ring-line dark:bg-primary-800 dark:text-white dark:ring-white/10">
          <div className="flex items-center justify-between border-b border-line px-4 py-3 dark:border-white/10">
            <p className="text-sm font-bold">Notifications</p>
            {unread > 0 && (
              <button onClick={markAll} className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
                <FiCheck size={13} /> Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted">Aucune notification.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => openItem(n)}
                  className={cn(
                    'flex w-full gap-3 border-b border-line px-4 py-3 text-left transition last:border-0 hover:bg-surface dark:border-white/5 dark:hover:bg-white/5',
                    !n.isRead && 'bg-accent-light/50 dark:bg-white/5'
                  )}
                >
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.isRead ? 'bg-transparent' : 'bg-accent')} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{n.title}</span>
                    <span className="mt-0.5 block text-xs text-muted line-clamp-2">{n.message}</span>
                    <span className="mt-1 block text-[11px] text-muted">{timeAgo(n.createdAt)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
