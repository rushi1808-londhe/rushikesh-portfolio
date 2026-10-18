import { useEffect, useState } from 'react';

interface Options {
  enabled: boolean;
  typeDelay?: number;
  deleteDelay?: number;
  holdDelay?: number;
  gapDelay?: number;
}

type Phase = 'typing' | 'holding' | 'deleting';

/** Typewriter that cycles forever: types a line, holds, erases it, then moves to the next line. */
export function useTypewriterLoop(lines: string[], { enabled, typeDelay = 55, deleteDelay = 28, holdDelay = 1800, gapDelay = 350 }: Options) {
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');
  const key = lines.join('\n');

  useEffect(() => {
    setIndex(0);
    setLength(0);
    setPhase('typing');
  }, [key]);

  // Count user-perceived characters so emoji are typed as one unit.
  const chars = Array.from(lines[index] ?? '');

  useEffect(() => {
    if (!enabled || lines.length === 0) return;
    let timer: number;
    if (phase === 'typing') {
      timer = length < chars.length ? window.setTimeout(() => setLength((l) => l + 1), typeDelay) : window.setTimeout(() => setPhase('holding'), 0);
    } else if (phase === 'holding') {
      timer = window.setTimeout(() => setPhase(lines.length > 1 ? 'deleting' : 'holding'), holdDelay);
    } else {
      timer =
        length > 0
          ? window.setTimeout(() => setLength((l) => l - 1), deleteDelay)
          : window.setTimeout(() => {
              setIndex((i) => (i + 1) % lines.length);
              setPhase('typing');
            }, gapDelay);
    }
    return () => window.clearTimeout(timer);
  }, [enabled, phase, length, chars.length, lines.length, typeDelay, deleteDelay, holdDelay, gapDelay]);

  return { text: chars.slice(0, length).join(''), index, phase };
}
