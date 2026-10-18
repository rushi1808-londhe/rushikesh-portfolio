import { useEffect, useState } from 'react';
import CrudTab from '../components/CrudTab';
import SkillIconPicker from '../components/SkillIconPicker';
import SkillLogo, { hasBundledIcon } from '../../components/SkillLogo';
import { skillsApi } from '../../api/admin';
import { bestLogoFor } from '../iconify';
import type { Skill } from '../../types';

/** New skills without a chosen logo (and no built-in one) get the best official logo automatically. */
async function ensureLogo(skill: Skill): Promise<Skill> {
  if (skill.iconData || skill.iconUrl || hasBundledIcon(skill.name)) return skill;
  const icon = await bestLogoFor(skill.name);
  return icon ? { ...skill, iconData: JSON.stringify(icon) } : skill;
}

export default function SkillsTab() {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    skillsApi
      .list()
      .then((list) => setCategories(Array.from(new Set(list.map((s) => s.category)))))
      .catch(() => setCategories([]));
  }, []);

  return (
    <CrudTab<Skill>
      title="Skill"
      api={skillsApi}
      empty={() => ({ name: '', category: categories[0] ?? '', displayOrder: 0 })}
      summary={(s) => ({
        primary: s.name,
        secondary: s.category,
        visual: (
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-white/10 bg-[#1b2238]">
            <SkillLogo skill={s} className="h-6 w-6" />
          </span>
        ),
      })}
      groupBy={(s) => s.category}
      beforeSave={ensureLogo}
      fields={[
        { key: 'name', label: 'Skill name', type: 'text', required: true },
        { key: 'category', label: 'Category (keyboard row)', type: 'datalist', required: true, options: categories },
        { key: 'displayOrder', label: 'Display order', type: 'number' },
        { key: 'iconData', label: 'Logo', type: 'custom', render: (item, set) => <SkillIconPicker skill={item} onChange={set} /> },
      ]}
    />
  );
}
