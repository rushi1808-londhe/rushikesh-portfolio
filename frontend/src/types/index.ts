export interface Profile {
  id?: number;
  name: string;
  title: string;
  tagline?: string;
  location?: string;
  phone?: string;
  email?: string;
  summary?: string;
  speechLines: string[];
  resumeUrl?: string;
  avatarUrl?: string;
  heroCode?: string;
}

export interface SocialLink {
  id?: number;
  platform: string;
  url: string;
  icon?: string;
  displayOrder: number;
}

export interface Skill {
  id?: number;
  name: string;
  category: string;
  displayOrder: number;
  /** Iconify icon JSON chosen in the admin panel. */
  iconData?: string;
  /** Uploaded logo image. */
  iconUrl?: string;
}

export interface Experience {
  id?: number;
  company: string;
  role: string;
  duration: string;
  location?: string;
  displayOrder: number;
  bullets: string[];
}

export interface ProjectImage {
  url: string;
  caption?: string;
}

export interface Project {
  id?: number;
  name: string;
  shortDescription: string;
  fullDescription?: string;
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  displayOrder: number;
  tags: string[];
  bullets: string[];
  images?: ProjectImage[];
}

export interface Certificate {
  id?: number;
  title: string;
  issuer?: string;
  issueDate?: string;
  credentialUrl?: string;
  imageUrl?: string;
  description?: string;
  displayOrder: number;
}

export interface Extracurricular {
  id?: number;
  title: string;
  description?: string;
  imageUrl?: string;
  eventDate?: string;
  displayOrder: number;
}

export interface Portfolio {
  profile: Profile;
  socialLinks: SocialLink[];
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
  certificates: Certificate[];
  extracurriculars: Extracurricular[];
}

export interface ContactRequest {
  name: string;
  email: string;
  message: string;
  /** Honeypot — always empty for humans. */
  website?: string;
}

export interface ContactMessage extends ContactRequest {
  id: number;
  read: boolean;
  createdAt: string;
}

export interface LoginResponse {
  username: string;
  expiresAt: string;
}

export interface UploadResponse {
  url: string;
  filename: string;
  contentType: string;
  size: number;
  /** Original PDF, when a PDF was converted to JPEG and kept. */
  sourceUrl?: string;
}

export interface ApiProblem {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string>;
}
