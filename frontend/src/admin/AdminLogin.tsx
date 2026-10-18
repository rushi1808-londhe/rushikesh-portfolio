import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from './AuthContext';
import { errorMessage } from '../api/client';
import Particles from '../components/Particles';

export default function AdminLogin() {
  const { login, isAuthenticated, status } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (status === 'checking') return null;
  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(username, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Login failed'));
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5">
      <Particles />
      <motion.form
        onSubmit={onSubmit}
        className="card relative z-10 w-full max-w-sm space-y-5 p-8 shadow-glow"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">Admin</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Sign in</h1>
        </div>
        <div>
          <label htmlFor="u" className="label">
            Username
          </label>
          <input
            id="u"
            className="input"
            autoComplete="username"
            maxLength={80}
            spellCheck={false}
            autoCapitalize="none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="p" className="label">
            Password
          </label>
          <input
            id="p"
            type="password"
            className="input"
            autoComplete="current-password"
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <p className="text-sm text-rose-400" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary w-full" disabled={busy || !username || !password}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <a href="/" className="block text-center text-xs text-slate-500 hover:text-cyan">
          ← Back to portfolio
        </a>
      </motion.form>
    </div>
  );
}
