/**
 * Auth service — the ONLY module that talks to Firebase Auth directly.
 * Everything above it (hooks, screens) depends on this interface, not on
 * Firebase. Swapping to Async Storage later would mean rewriting only this file.
 */
import { firebaseAuth } from '../../../lib/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
}

const mapUser = (u: { uid: string; email: string | null }): AuthUser => ({
  uid: u.uid,
  email: u.email,
});

export const authService = {
  async signUp(email: string, password: string): Promise<AuthUser> {
    const cred = await firebaseAuth.createUserWithEmailAndPassword(email, password);
    return mapUser(cred.user);
  },

  async signIn(email: string, password: string): Promise<AuthUser> {
    const cred = await firebaseAuth.signInWithEmailAndPassword(email, password);
    return mapUser(cred.user);
  },

  async signOut(): Promise<void> {
    await firebaseAuth.signOut();
  },

  /** Returns an unsubscribe fn. Drives the root navigator's auth state. */
  onAuthStateChanged(cb: (user: AuthUser | null) => void): () => void {
    return firebaseAuth.onAuthStateChanged(u => cb(u ? mapUser(u) : null));
  },

  getCurrentUser(): AuthUser | null {
    const u = firebaseAuth.currentUser;
    return u ? mapUser(u) : null;
  },

  /** Fresh ID token — what we persist (in Keychain) to enable biometric unlock. */
  async getIdToken(): Promise<string | null> {
    const u = firebaseAuth.currentUser;
    return u ? u.getIdToken() : null;
  },

  /** Translates Firebase error codes into user-facing copy. */
  humanizeError(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'That email is already registered. Try signing in.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Incorrect email or password.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return 'Something went wrong. Please try again.';
    }
  },
};
