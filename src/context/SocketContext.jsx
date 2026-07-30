import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { SOCKET_URL } from '@/constants';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { autoConnect: true });
    return () => socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    if (user?.id && socketRef.current) {
      socketRef.current.emit('join', user.id);
      if (user.role === 'admin') socketRef.current.emit('join:admin');
    }
  }, [user]);

  return <SocketContext.Provider value={socketRef}>{children}</SocketContext.Provider>;
}

export const useSocket = () => useContext(SocketContext);
