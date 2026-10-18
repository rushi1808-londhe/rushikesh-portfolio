import { useCallback, useEffect, useRef } from 'react';
import clickUrl from '../assets/sounds/key-click.wav';

/**
 * Plays the short key-click audio file. Uses Web Audio (decoded once) for low latency and
 * overlapping clicks; falls back to an <audio> element where Web Audio is unavailable.
 */
export function useClickSound(volume = 0.35) {
  const ctxRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const loadingRef = useRef<Promise<void> | null>(null);
  const lastRef = useRef(0);

  const load = useCallback(() => {
    if (loadingRef.current) return loadingRef.current;
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return Promise.resolve();
    ctxRef.current = new AudioCtx();
    loadingRef.current = fetch(clickUrl)
      .then((r) => r.arrayBuffer())
      .then((data) => ctxRef.current!.decodeAudioData(data))
      .then((buffer) => {
        bufferRef.current = buffer;
      })
      .catch(() => undefined);
    return loadingRef.current;
  }, []);

  useEffect(() => {
    // Browsers only allow audio after a user gesture; prepare on first interaction.
    const unlock = () => {
      void load().then(() => {
        if (ctxRef.current?.state === 'suspended') void ctxRef.current.resume();
      });
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      void ctxRef.current?.close();
    };
  }, [load]);

  return useCallback(() => {
    const now = performance.now();
    if (now - lastRef.current < 35) return;
    lastRef.current = now;
    try {
      const ctx = ctxRef.current;
      const buffer = bufferRef.current;
      if (ctx && buffer) {
        if (ctx.state === 'suspended') void ctx.resume();
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.playbackRate.value = 0.92 + Math.random() * 0.16;
        const gain = ctx.createGain();
        gain.gain.value = volume;
        src.connect(gain).connect(ctx.destination);
        src.start();
        return;
      }
      void load();
      const audio = new Audio(clickUrl);
      audio.volume = volume;
      void audio.play().catch(() => undefined);
    } catch {
      // Sound is decorative; ignore autoplay-policy failures.
    }
  }, [load, volume]);
}
