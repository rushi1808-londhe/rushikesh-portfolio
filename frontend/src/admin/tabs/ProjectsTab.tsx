import { useEffect, useState } from 'react';
import CrudTab from '../components/CrudTab';
import SkillTagPicker from '../components/SkillTagPicker';
import ProjectImagesEditor from '../components/ProjectImagesEditor';
import { projectsApi, skillsApi } from '../../api/admin';
import type { Project, Skill } from '../../types';

export default function ProjectsTab() {
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    skillsApi
      .list()
      .then(setSkills)
      .catch(() => setSkills([]));
  }, []);

  return (
    <CrudTab<Project>
      title="Project"
      api={projectsApi}
      empty={() => ({ name: '', shortDescription: '', fullDescription: '', githubUrl: '', liveUrl: '', displayOrder: 0, tags: [], bullets: [], images: [] })}
      summary={(p) => ({
        primary: p.name,
        secondary: `${p.images?.length ?? 0} screenshot(s) · ${p.tags.join(', ') || p.githubUrl || ''}`,
        image: p.images?.[0]?.url ?? p.imageUrl,
      })}
      fields={[
        { key: 'name', label: 'Name', type: 'text', required: true, full: true },
        { key: 'shortDescription', label: 'Short description (card front)', type: 'textarea', required: true },
        { key: 'fullDescription', label: 'Full description (card back)', type: 'textarea' },
        { key: 'githubUrl', label: 'GitHub URL', type: 'url' },
        { key: 'liveUrl', label: 'Live URL', type: 'url' },
        { key: 'displayOrder', label: 'Display order', type: 'number' },
        {
          key: 'tags',
          label: 'Tech stack / skills shown on the card',
          type: 'custom',
          render: (item, set) => (
            <SkillTagPicker label="Tech stack / skills shown on the card" value={item.tags} skills={skills} onChange={(tags) => set({ tags })} />
          ),
        },
        { key: 'bullets', label: 'Highlights', type: 'list-multiline' },
        {
          key: 'images',
          label: 'Screenshots',
          type: 'custom',
          render: (item, set) => <ProjectImagesEditor value={item.images ?? []} onChange={(images) => set({ images })} />,
        },
      ]}
    />
  );
}
