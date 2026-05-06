import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { api } from './api';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

function getFirebaseApp() {
  if (!firebaseConfig.apiKey) return null;
  if (!getApps().length) return initializeApp(firebaseConfig);
  return getApps()[0];
}

export async function registerFcmAndSyncToken() {
  if (!(await isSupported())) return null;
  const app = getFirebaseApp();
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!app || !vapidKey) return null;
  const messaging = getMessaging(app);
  const token = await getToken(messaging, { vapidKey });
  if (token) {
    await api.post('/notification/device-token', { token }, { skipErrorToast: true });
  }
  onMessage(messaging, (payload) => {
    // Foreground messages — could dispatch custom event for UI
    void payload;
  });
  return token;
}
