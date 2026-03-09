import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '../../shared/types';

const URL = import.meta.env.DEV
  ? 'http://localhost:3001'
  : window.location.origin;

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionDelayMax: 3000,
  reconnectionAttempts: Infinity,
  timeout: 30000,
  // Start with WebSocket, fall back to polling if needed
  transports: ['websocket', 'polling'],
  // Upgrade from polling to websocket when available
  upgrade: true,
});
