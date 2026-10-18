import CrudTab from '../components/CrudTab';
import { experiencesApi } from '../../api/admin';
import type { Experience } from '../../types';

export default function ExperienceTab() {
  return (
    <CrudTab<Experience>
      title="Experience"
      api={experiencesApi}
      empty={() => ({ company: '', role: '', duration: '', location: '', displayOrder: 0, bullets: [] })}
      summary={(e) => ({ primary: `${e.role} · ${e.company}`, secondary: e.duration })}
      fields={[
        { key: 'company', label: 'Company', type: 'text', required: true },
        { key: 'role', label: 'Role', type: 'text', required: true },
        { key: 'duration', label: 'Duration', type: 'text', required: true, placeholder: 'June 2026 – Present' },
        { key: 'location', label: 'Location', type: 'text' },
        { key: 'displayOrder', label: 'Display order', type: 'number' },
        { key: 'bullets', label: 'Bullet points', type: 'list-multiline', placeholder: 'Describe an achievement with impact numbers…' },
      ]}
    />
  );
}
