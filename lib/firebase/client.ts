// Client-side Firebase Auth handle. Only login/signup and the sidebar's
// lazy sign-out import this — importing it anywhere else drags the auth
// SDK into that page's bundle.

import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase/app';

export { firebaseApp };
export const auth = getAuth(firebaseApp);
