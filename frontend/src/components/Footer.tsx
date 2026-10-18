import type { Profile, SocialLink } from '../types';
import { SiGmail } from 'react-icons/si';
import SocialIcon from './SocialIcon';

export default function Footer({ profile, socialLinks }: { profile: Profile; socialLinks: SocialLink[] }) {
  return (
    <footer className="border-t border-cyan/10 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-slate-500 sm:flex-row sm:px-8">
        <p>
          © {new Date().getFullYear()} {profile.name}
          {profile.location && <span className="text-slate-600"> · {profile.location}</span>}
        </p>
        <div className="flex gap-3">
          {socialLinks.map((s) => (
            <a key={s.id ?? s.url} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.platform} className="transition hover:text-cyan">
              <SocialIcon name={s.icon ?? s.platform} className="h-4 w-4" />
            </a>
          ))}
          {profile.email && (
            <a href={`mailto:${profile.email}`} aria-label={`Email ${profile.email}`} className="transition hover:text-cyan">
              <SiGmail className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
