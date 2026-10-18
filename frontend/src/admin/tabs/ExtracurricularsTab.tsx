import CrudTab from '../components/CrudTab';
import { extracurricularsApi } from '../../api/admin';
import type { Extracurricular } from '../../types';

export default function ExtracurricularsTab() {
  return (
    <CrudTab<Extracurricular>
      title="Extracurricular"
      api={extracurricularsApi}
      empty={() => ({ title: '', description: '', eventDate: '', displayOrder: 0 })}
      summary={(x) => ({ primary: x.title, secondary: x.eventDate, image: x.imageUrl })}
      fields={[
        { key: 'title', label: 'Title', type: 'text', required: true, full: true },
        { key: 'eventDate', label: 'Date', type: 'text', placeholder: 'e.g. January 2026' },
        { key: 'displayOrder', label: 'Display order', type: 'number' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'imageUrl', label: 'Image or PDF', type: 'image', convertToJpeg: true },
      ]}
    />
  );
}
