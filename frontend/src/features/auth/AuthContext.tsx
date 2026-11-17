import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../services/apiClient';
import { AuthUser } from '../../types';
import { authApi } from './authApi';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then(({ user: activeUser }) => setUserState(activeUser))
      .catch((error: unknown) => {
        if (!(error instanceof ApiError && error.status === 401)) console.error(error);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      setUser: setUserState,
      logout: async () => {
        await authApi.logout();
        setUserState(null);
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  return context;
}
