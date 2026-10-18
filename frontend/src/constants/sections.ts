/** Structural section ids/labels used for navigation. All portfolio content comes from the API. */
export type SectionId = 'home' | 'skills' | 'experience' | 'projects' | 'gallery' | 'contact';

export interface SectionDef {
  id: SectionId;
  label: string;
}

export const SECTIONS: SectionDef[] = [
  { id: 'home', label: 'Home' },
  { id: 'skills', label: 'Tech Stack' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'gallery', label: 'Achievements' },
  { id: 'contact', label: 'Contact' },
];

export const PORTFOLIO_UPDATED_CHANNEL = 'portfolio-updated';
