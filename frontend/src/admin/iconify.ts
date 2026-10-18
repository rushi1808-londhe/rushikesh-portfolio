import type { IconifyIcon } from '@iconify/react';

/**
 * Admin-only helpers for the public Iconify API. The chosen icon's SVG data is stored with the skill,
 * so the public site renders logos offline and never calls Iconify itself.
 */
const API = 'https://api.iconify.design';
/** Colourful official logos first, monochrome brand icons last. */
const PREFIXES = ['logos', 'devicon', 'skill-icons', 'simple-icons'];

/** Lower is better: square symbol logos beat wordmarks, which are unreadable on a small key. */
function rank(id: string): number {
  const [prefix, name] = id.split(':');
  let score: number;
  if (prefix === 'logos') score = name.endsWith('-icon') ? 0 : 4;
  else if (prefix === 'devicon') score = 1;
  else if (prefix === 'skill-icons') score = 2;
  else score = 6;
  if (/wordmark|-text|-full|-horizontal|-vertical|-banner/.test(name)) score += 20;
  return score;
}

export interface IconCandidate {
  id: string;
  previewUrl: string;
}

export async function searchIconify(query: string, limit = 32): Promise<IconCandidate[]> {
  const url = `${API}/search?query=${encodeURIComponent(query.trim())}&limit=${limit}&prefixes=${PREFIXES.join(',')}`;
  const res = await fetch(url, { referrerPolicy: 'no-referrer', credentials: 'omit' });
  if (!res.ok) throw new Error(`Iconify search failed: ${res.status}`);
  const data = (await res.json()) as { icons?: string[] };
  const icons = (data.icons ?? []).filter((id) => /^[a-z0-9-]+:[a-z0-9-]+$/.test(id));
  icons.sort((a, b) => rank(a) - rank(b));
  return icons.map((id) => {
    const [prefix, name] = id.split(':');
    // simple-icons are monochrome: preview them in white so they're visible on the dark tiles.
    const color = prefix === 'simple-icons' ? '?color=%23ffffff' : '';
    return { id, previewUrl: `${API}/${prefix}/${name}.svg${color}` };
  });
}

export async function fetchIconifyIcon(id: string): Promise<IconifyIcon> {
  const [prefix, name] = id.split(':');
  const res = await fetch(`${API}/${prefix}.json?icons=${encodeURIComponent(name)}`, { referrerPolicy: 'no-referrer', credentials: 'omit' });
  if (!res.ok) throw new Error(`Iconify fetch failed: ${res.status}`);
  const data = (await res.json()) as {
    icons?: Record<string, { body: string; width?: number; height?: number }>;
    aliases?: Record<string, { parent: string }>;
    width?: number;
    height?: number;
  };
  const icon = data.icons?.[name] ?? (data.aliases?.[name] ? data.icons?.[data.aliases[name].parent] : undefined);
  if (!icon) throw new Error('Icon not found');
  let body = icon.body;
  if (prefix === 'simple-icons') body = body.replace(/currentColor/g, '#ffffff');
  return { body, width: icon.width ?? data.width ?? 24, height: icon.height ?? data.height ?? 24 };
}

/** Best official logo for a skill name, or null if none / offline. */
export async function bestLogoFor(name: string): Promise<IconifyIcon | null> {
  try {
    const [first] = await searchIconify(name, 8);
    return first ? await fetchIconifyIcon(first.id) : null;
  } catch {
    return null;
  }
}
