import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDHCNCa8hmukJQCtDW3jt7tuPuA9uBJQVA',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'arthora-659a8.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'arthora-659a8',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'arthora-659a8.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '345718727196',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:345718727196:web:ec673e02cc29efa9e235d9',
};

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export {
  app,
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};

export type { FirebaseUser };

/**
 * Initiates Google OAuth popup sign-in and returns the Firebase ID token.
 * Includes a timeout so the UI never hangs indefinitely when popups or cross-origin
 * communication are blocked (e.g., in Brave or ad blockers).
 */
export async function signInWithGoogle(timeoutMs = 45000): Promise<{ idToken: string; user: FirebaseUser }> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error(
            'Google Sign-In timed out. If you are using Brave or an ad blocker, please disable Shields or allow popups/cookies for this site, or sign in using email & password.'
          )
        ),
      timeoutMs
    )
  );

  const authPromise = (async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      return { idToken, user: result.user };
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled. Please try again.');
      }
      if (firebaseError.code === 'auth/popup-blocked') {
        throw new Error('Popup blocked by your browser. Please allow popups for this site and try again, or use email login.');
      }
      if (firebaseError.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google Sign-In in Firebase.');
      }
      throw error;
    }
  })();

  return Promise.race([authPromise, timeoutPromise]);
}

/**
 * Initiates Google Sign-In via full-page redirect for browsers that block popups (e.g. Brave, mobile).
 */
export async function signInWithGoogleRedirect(): Promise<void> {
  await signInWithRedirect(auth, googleProvider);
}

/**
 * Checks if a redirect sign-in was completed.
 */
export async function getGoogleRedirectResult(): Promise<{ idToken: string; user: FirebaseUser } | null> {
  try {
    const result = await getRedirectResult(auth);
    if (!result) return null;
    const idToken = await result.user.getIdToken();
    return { idToken, user: result.user };
  } catch (error) {
    console.warn('Google redirect result error:', error);
    return null;
  }
}
