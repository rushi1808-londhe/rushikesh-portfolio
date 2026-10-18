import type { IconType } from 'react-icons';
import { FaGithub, FaLinkedinIn, FaLink, FaInstagram, FaYoutube, FaMedium, FaDev, FaStackOverflow } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';

const ICONS: Record<string, IconType> = {
  github: FaGithub,
  linkedin: FaLinkedinIn,
  twitter: FaXTwitter,
  x: FaXTwitter,
  email: MdEmail,
  mail: MdEmail,
  instagram: FaInstagram,
  youtube: FaYoutube,
  medium: FaMedium,
  dev: FaDev,
  stackoverflow: FaStackOverflow,
};

interface Props {
  name?: string;
  className?: string;
}

export default function SocialIcon({ name, className = 'h-5 w-5' }: Props) {
  const Icon = ICONS[(name ?? '').toLowerCase().replace(/[^a-z]/g, '')] ?? FaLink;
  return <Icon className={className} aria-hidden="true" />;
}
