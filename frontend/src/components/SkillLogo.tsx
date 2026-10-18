import { useMemo } from 'react';
import { Icon, type IconifyIcon } from '@iconify/react';
import type { Skill } from '../types';
import { hasBundledIcon, skillIcon } from '../sections/TechKeyboard/skillIcons';

interface Props {
  /** The skill (preferred: carries any admin-chosen logo). */
  skill?: Skill;
  /** Fallback lookup by name, e.g. for project tags. */
  name?: string;
  /** All skills, used to find a custom logo when only a name is known. */
  skills?: Skill[];
  className?: string;
}

function parseIcon(json?: string): IconifyIcon | null {
  if (!json) return null;
  try {
    const data = JSON.parse(json) as IconifyIcon;
    return typeof data.body === 'string' ? data : null;
  } catch {
    return null;
  }
}

/** Logo for a skill: admin-chosen icon → uploaded image → bundled logo by name → generic glyph. */
export default function SkillLogo({ skill, name, skills, className = 'h-5 w-5' }: Props) {
  const resolved = useMemo(() => {
    const match = skill ?? skills?.find((s) => s.name.toLowerCase() === (name ?? '').toLowerCase());
    const label = match?.name ?? name ?? '';
    return { custom: parseIcon(match?.iconData), image: match?.iconUrl, label };
  }, [skill, name, skills]);

  if (resolved.custom) return <Icon icon={resolved.custom} className={className} aria-hidden="true" />;
  if (resolved.image) return <img src={resolved.image} alt="" className={`${className} object-contain`} loading="lazy" draggable={false} />;
  return <Icon icon={skillIcon(resolved.label)} className={className} aria-hidden="true" />;
}

export { hasBundledIcon };
