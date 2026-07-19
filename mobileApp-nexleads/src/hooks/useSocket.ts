import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../config/api';
import { useAuth } from './useAuth';

export function useSocket() {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socket = io(BASE_URL.replace('/api', ''), {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', { userId: user._id });
    });

    return () => {
      socket.emit('leave', { userId: user._id });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user]);

  return socketRef.current;
}
