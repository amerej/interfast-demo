import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:8080';
    socket = io(`${baseUrl}/ws`, {
      path: '/backend/socket.io',
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}
