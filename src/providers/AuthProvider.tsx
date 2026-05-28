import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { authService, AuthUser } from '../features/auth/services/authService';
import { biometricsService } from '../features/auth/services/biometrics';

interface AuthContextValue {
  user: AuthUser | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  enableBiometrics: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Single source of truth for session state. The root navigator reads `user`
 * to decide which stack to render, so login/logout cause navigation purely
 * through state — no imperative navigation.reset() calls scattered around.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(nextUser => {
      setUser(nextUser);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await authService.signIn(email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    await authService.signUp(email, password);
  }, []);

  const signOut = useCallback(async () => {
    await biometricsService.clearBiometricSession();
    await authService.signOut();
  }, []);

  const enableBiometrics = useCallback((email: string) => {
    return biometricsService.enableBiometricSession(email);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, signIn, signUp, signOut, enableBiometrics }),
    [user, initializing, signIn, signUp, signOut, enableBiometrics],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
