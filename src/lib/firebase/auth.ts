import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirebaseAuth } from './config';

function getAuthOrThrow() {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase auth is not initialized. Check NEXT_PUBLIC_FIREBASE_* env vars.');
  }
  return auth;
}

export async function signUp(email: string, password: string): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(getAuthOrThrow(), email, password);
  return result.user;
}

export async function signIn(email: string, password: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(getAuthOrThrow(), email, password);
  return result.user;
}

export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    if (typeof window !== 'undefined') {
      console.warn('Firebase auth is not initialized.');
      callback(null);
    }
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): FirebaseUser | null {
  const auth = getFirebaseAuth();
  return auth ? auth.currentUser : null;
}

export async function getIdToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}
