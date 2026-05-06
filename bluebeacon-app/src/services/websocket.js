import { io } from 'socket.io-client';
import { getAccessToken } from './api';

const origin =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || window.location.origin;

let socket;

function getSocket() {
  if (!socket) {
    socket = io(origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      extraHeaders: getAccessToken()
        ? { Authorization: `Bearer ${getAccessToken()}` }
        : undefined,
    });
  }
  return socket;
}

/**
 * Subscribe to Socket.IO incident room updates (backend: incident.subscribe + incident.updated).
 * @returns {() => void} unsubscribe
 */
export function subscribeIncidentUpdates(incidentId, onUpdate) {
  const s = getSocket();
  const handler = (payload) => {
    if (!payload?.id || payload.id === incidentId) onUpdate(payload);
  };
  s.emit('incident.subscribe', incidentId);
  s.on('incident.updated', handler);
  return () => {
    s.off('incident.updated', handler);
  };
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = undefined;
}
