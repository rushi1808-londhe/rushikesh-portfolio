import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setUnauthorizedHandler } from '../api/client';
import { fetchSession, login as loginRequest, logout as logoutRequest } from '../api/admin';

type Status = 'checking' | 'authenticated' | 'anonymous';

interface AuthState {
  status: Status;
  username: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Session state for the admin panel. The JWT is an HttpOnly cookie, so the client only learns
 * "am I signed in?" from /auth/me and never touches the token itself.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('checking');
  const [username, setUsername] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  const clear = useCallback(() => {
    setStatus('anonymous');
    setUsername(null);
    setExpiresAt(null);
  }, []);

  useEffect(() => {
    if (!window.location.pathname.startsWith('/admin')) {
      setStatus('anonymous');
      return;
    }
    fetchSession()
      .then((s) => {
        setUsername(s.username);
        setExpiresAt(new Date(s.expiresAt).getTime());
        setStatus('authenticated');
      })
      .catch(clear);
  }, [clear]);

  const login = useCallback(async (user: string, password: string) => {
    const res = await loginRequest(user, password);
    setUsername(res.username);
    setExpiresAt(new Date(res.expiresAt).getTime());
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clear();
    }
  }, [clear]);

  // Any 401 from the API ends the session; so does reaching the token's expiry.
  useEffect(() => {
    setUnauthorizedHandler(clear);
    return () => setUnauthorizedHandler(null);
  }, [clear]);

  useEffect(() => {
    if (!expiresAt) return;
    const ms = expiresAt - Date.now();
    if (ms <= 0) {
      clear();
      return;
    }
    const t = window.setTimeout(clear, Math.min(ms, 2_147_000_000));
    return () => window.clearTimeout(t);
  }, [expiresAt, clear]);

  const value = useMemo(() => ({ status, username, isAuthenticated: status === 'authenticated', login, logout }), [status, username, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
