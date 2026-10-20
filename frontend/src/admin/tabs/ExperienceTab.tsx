import { useEffect, useState } from 'react';
import CrudTab from '../components/CrudTab';
import SkillTagPicker from '../components/SkillTagPicker';
import { experiencesApi, skillsApi } from '../../api/admin';
import { matchSkills } from '../../utils/insights';
import type { Experience, Skill } from '../../types';

export default function ExperienceTab() {
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    skillsApi
      .list()
      .then(setSkills)
      .catch(() => setSkills([]));
  }, []);

  return (
    <CrudTab<Experience>
      title="Experience"
      api={experiencesApi}
      empty={() => ({ company: '', role: '', duration: '', location: '', displayOrder: 0, bullets: [], skills: [] })}
      summary={(e) => ({ primary: `${e.role} · ${e.company}`, secondary: e.duration, image: e.logoUrl })}
      fields={[
        { key: 'company', label: 'Company', type: 'text', required: true },
        { key: 'role', label: 'Role', type: 'text', required: true },
        { key: 'duration', label: 'Duration', type: 'text', required: true, placeholder: 'June 2026 – Present' },
        { key: 'location', label: 'Location', type: 'text' },
        { key: 'displayOrder', label: 'Display order', type: 'number' },
        // Optional: without a logo the timeline shows the company's initials.
        { key: 'logoUrl', label: 'Company logo', type: 'image' },
        { key: 'bullets', label: 'Bullet points', type: 'list-multiline', placeholder: 'Describe an achievement with impact numbers…' },
        {
          key: 'skills',
          label: 'Stack',
          type: 'custom',
          render: (item, set) => {
            const selected = item.skills ?? [];
            // With nothing picked, the public page detects the stack from the bullets; show what that gives.
            const detected = selected.length === 0 ? matchSkills(item.bullets ?? [], skills, 8).map((s) => s.name) : [];
            return (
              <div className="space-y-2">
                <SkillTagPicker label="Stack (skills shown on the timeline)" value={selected} skills={skills} onChange={(next) => set({ skills: next })} />
                {detected.length > 0 && (
                  <p className="text-xs text-slate-400">
                    None picked, so the site auto-detects from the bullet points: {detected.join(', ')}.{' '}
                    <button type="button" className="text-cyan underline hover:text-white" onClick={() => set({ skills: detected })}>
                      Use these and edit
                    </button>
                  </p>
                )}
              </div>
            );
          },
        },
      ]}
    />
  );
}
