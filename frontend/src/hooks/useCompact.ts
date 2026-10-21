import { useEffect, useState } from 'react';

/** Phones and touch tablets: scroll-linked 3D effects are swapped for light, one-off reveals here. */
const QUERY = '(max-width: 767px), (pointer: coarse)';

export const isCompact = () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches;

export function useCompact(): boolean {
  const [compact, setCompact] = useState(isCompact);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setCompact(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return compact;
}
