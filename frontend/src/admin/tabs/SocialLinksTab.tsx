import CrudTab from '../components/CrudTab';
import { socialLinksApi } from '../../api/admin';
import type { SocialLink } from '../../types';

export default function SocialLinksTab() {
  return (
    <CrudTab<SocialLink>
      title="Social Link"
      api={socialLinksApi}
      empty={() => ({ platform: '', url: '', icon: '', displayOrder: 0 })}
      summary={(s) => ({ primary: s.platform, secondary: s.url })}
      fields={[
        { key: 'platform', label: 'Platform', type: 'text', required: true },
        { key: 'url', label: 'URL', type: 'url', required: true },
        { key: 'icon', label: 'Icon', type: 'datalist', options: ['github', 'linkedin', 'twitter', 'email'], placeholder: 'github' },
        { key: 'displayOrder', label: 'Display order', type: 'number' },
      ]}
    />
  );
}
