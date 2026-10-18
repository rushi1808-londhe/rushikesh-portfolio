import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchPortfolio } from '../api/public';
import { errorMessage } from '../api/client';
import { PORTFOLIO_UPDATED_CHANNEL } from '../constants/sections';
import type { Portfolio } from '../types';

interface PortfolioState {
  data: Portfolio | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioState | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const next = await fetchPortfolio();
      setData(next);
      setError(null);
    } catch (e) {
      setError(errorMessage(e, 'Unable to load portfolio content.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();

    // Live updates: admin panel broadcasts after every save; also refresh when tab regains focus.
    let channel: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel(PORTFOLIO_UPDATED_CHANNEL);
      channel.onmessage = () => void reload();
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') void reload();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      channel?.close();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [reload]);

  return <PortfolioContext.Provider value={{ data, loading, error, reload }}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio(): PortfolioState {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
}

export function notifyPortfolioUpdated() {
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel(PORTFOLIO_UPDATED_CHANNEL);
    channel.postMessage({ at: Date.now() });
    channel.close();
  }
}
