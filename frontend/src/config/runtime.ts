/** Runtime configuration injected by Nginx at container start (see docker-entrypoint.d/40-env-config.sh). */
const env = window.__ENV__ ?? {};

export const runtimeConfig = {
  useVideoHero: String(env.USE_VIDEO_HERO ?? 'false').toLowerCase() === 'true',
  apiBase: '/api/v1',
} as const;
