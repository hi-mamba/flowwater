import { io, Socket } from 'socket.io-client';
import { onAppStateChange } from './appLifecycle';

const DEFAULT_SERVER_URL = import.meta.env.VITE_SOCKET_URL as string || 'http://localhost:3000';

let socket: Socket | null = null;
let serverUrl = DEFAULT_SERVER_URL;

/** Get the current socket instance (may be null if not connected). */
export function getSocket(): Socket | null {
  return socket;
}

/** Current server base URL (shared by the news HTTP client). */
export function getServerUrl(): string {
  return serverUrl;
}

/** Connect (or reconnect) to the socket server. Returns the socket instance. */
export function connectSocket(url?: string): Socket {
  if (url) serverUrl = url;

  if (socket?.connected) return socket;

  // Clean up old socket if exists
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  socket = io(serverUrl, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason: string) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err: Error) => {
    console.warn('[Socket] Connection error:', err.message);
  });

  return socket;
}

/** Disconnect the socket. */
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

let lifecycleUnsub: (() => void) | null = null;

/**
 * Start auto-managing socket lifecycle based on app state.
 * Connects when app resumes, disconnects when app pauses.
 * Returns a cleanup function.
 */
export function initSocketLifecycle(): () => void {
  if (lifecycleUnsub) return lifecycleUnsub;

  lifecycleUnsub = onAppStateChange((state) => {
    if (state.isActive) {
      if (!socket?.connected) {
        connectSocket();
      }
    } else {
      disconnectSocket();
    }
  });

  return () => {
    lifecycleUnsub?.();
    lifecycleUnsub = null;
    disconnectSocket();
  };
}

/** Change the socket server URL. Disconnects current and connects to new. */
export function setSocketServerUrl(url: string): void {
  serverUrl = url;
  if (socket?.connected) {
    disconnectSocket();
    connectSocket(url);
  }
}
