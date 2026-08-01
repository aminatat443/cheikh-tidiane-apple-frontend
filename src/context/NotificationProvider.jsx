import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { FiBell, FiX } from 'react-icons/fi';
import { useSocket } from './SocketContext';

/**
 * Écoute les notifications temps réel (Socket.IO `notification:new`),
 * rafraîchit le cache et affiche un toast éphémère. À monter une seule fois.
 */
export function NotificationProvider({ children }) {
  const socketRef = useSocket();
  const user = useSelector((s) => s.auth.user);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x._id !== id)), []);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket || !user?.id) return undefined;

    const handler = (n) => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      const _id = `${n.id ?? ''}-${Date.now()}`;
      setToasts((t) => [{ _id, ...n }, ...t].slice(0, 4));
    };

    socket.on('notification:new', handler);
    return () => socket.off('notification:new', handler);
  }, [socketRef, user, qc]);

  return (
    <>
      {children}

      {/* Pile de toasts */}
      <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t._id} toast={t} onClose={() => dismiss(t._id)} onOpen={() => {
            if (t.link) navigate(t.link);
            dismiss(t._id);
          }} />
        ))}
      </div>
    </>
  );
}

function Toast({ toast, onClose, onOpen }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="pointer-events-auto animate-fade-in overflow-hidden rounded-2xl bg-white shadow-card-hover ring-1 ring-line dark:bg-primary-800 dark:ring-white/10">
      <div className="flex items-start gap-3 p-4">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
          <FiBell size={17} />
        </span>
        <button onClick={onOpen} className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold text-primary dark:text-white">{toast.title}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted">{toast.message}</p>
        </button>
        <button
          onClick={onClose}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-primary dark:hover:bg-white/10"
          aria-label="Fermer"
        >
          <FiX size={15} />
        </button>
      </div>
      <div className="h-1 w-full bg-accent/20">
        <div className="h-full bg-accent" style={{ animation: 'toastbar 6s linear forwards' }} />
      </div>
    </div>
  );
}
