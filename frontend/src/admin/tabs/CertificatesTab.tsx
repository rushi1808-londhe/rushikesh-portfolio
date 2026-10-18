import CrudTab from '../components/CrudTab';
import { certificatesApi } from '../../api/admin';
import type { Certificate } from '../../types';

export default function CertificatesTab() {
  return (
    <CrudTab<Certificate>
      title="Certificate"
      api={certificatesApi}
      empty={() => ({ title: '', issuer: '', issueDate: '', credentialUrl: '', description: '', displayOrder: 0 })}
      summary={(c) => ({ primary: c.title, secondary: [c.issuer, c.issueDate].filter(Boolean).join(' · '), image: c.imageUrl })}
      fields={[
        { key: 'title', label: 'Title', type: 'text', required: true, full: true },
        { key: 'issuer', label: 'Issuer', type: 'text' },
        { key: 'issueDate', label: 'Issue date', type: 'text', placeholder: 'e.g. March 2026' },
        { key: 'credentialUrl', label: 'Credential URL', type: 'url' },
        { key: 'displayOrder', label: 'Display order', type: 'number' },
        { key: 'description', label: 'Description', type: 'textarea' },
        {
          key: 'imageUrl',
          label: 'Certificate (image or PDF)',
          type: 'image',
          convertToJpeg: true,
          keepPdf: true,
          // A PDF upload also becomes the "View credential" link unless one is already set.
          onUpload: (upload, item) => (upload.sourceUrl && !item.credentialUrl ? { credentialUrl: upload.sourceUrl } : {}),
        },
      ]}
    />
  );
}
