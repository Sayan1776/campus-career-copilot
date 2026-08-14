// This runs in the browser as a service worker, separate from your app's
// JS bundle. It handles push notifications when the tab isn't focused.
// Must live at the site root (public/) — FCM requires this exact path.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// NOTE: this config is safe to expose (it's the same public client config
// used in lib/firebase/client.ts) — it does not grant any privileged access.
firebase.initializeApp({
  apiKey: 'AIzaSyCBxExRFTKhK6J2745QGXpBTW49hKa7QIk',
  authDomain: 'campus-career-copilot.firebaseapp.com',
  projectId: 'campus-career-copilot',
  storageBucket: 'campus-career-copilot.firebasestorage.app',
  messagingSenderId: '36794617427',
  appId: '1:36794617427:web:addf3dfac25d4e5d12c0a6',
});
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'Campus Career Copilot', {
    body: body || '',
    icon: '/icon.png',
  });
});
