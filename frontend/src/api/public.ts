import { api } from './client';
import type { ContactRequest, Portfolio } from '../types';

let prefetched: Promise<Portfolio> | null = null;

async function requestPortfolio(): Promise<Portfolio> {
  const { data } = await api.get<Portfolio>('/portfolio');
  return data;
}

/** Starts loading portfolio content early (e.g. while the boot animation plays). */
export function prefetchPortfolio(): void {
  if (!prefetched) {
    prefetched = requestPortfolio();
    prefetched.catch(() => undefined); // surfaced on the real fetch
  }
}

export async function fetchPortfolio(): Promise<Portfolio> {
  // The first fetch reuses the prefetched request; later fetches (live updates) always hit the API.
  if (prefetched) {
    const pending = prefetched;
    prefetched = null;
    return pending;
  }
  return requestPortfolio();
}

export async function sendContact(payload: ContactRequest): Promise<void> {
  await api.post('/contact', payload);
}
