import { useMemo, useState } from 'react';
import type { Certificate, Extracurricular } from '../types';
import SectionHeading from '../components/SectionHeading';
import Lightbox, { type LightboxItem } from '../components/Lightbox';
import ScrollScene from '../components/ScrollScene';

interface Props {
  certificates: Certificate[];
  extracurriculars: Extracurricular[];
}

/** Only real images are rendered as pictures; uploads are stored as JPEG, so a PDF here means legacy data. */
const isPdf = (url?: string) => !!url && /\.pdf($|\?)/i.test(url);
const isImage = (url?: string) => !!url && !isPdf(url);
const linkLabel = (url: string) => (isPdf(url) ? 'View PDF ↗' : 'View credential ↗');

interface Tile extends LightboxItem {
  key: string;
  hasImage: boolean;
}

function MasonryGroup({ heading, tiles }: { heading: string; tiles: Tile[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const withImages = useMemo(() => tiles.filter((t) => t.hasImage), [tiles]);

  return (
    <div className="mb-16 last:mb-0">
      <h3 className="mb-6 flex items-center gap-3 font-mono text-sm uppercase tracking-[0.25em] text-cyan">
        <span className="h-px w-8 bg-cyan" />
        {heading}
      </h3>
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {tiles.map((tile, i) => (
          <ScrollScene key={tile.key} variant={i % 3 === 1 ? 'zoom' : 'rise'} className="mb-5 break-inside-avoid">
            <figure className="card group overflow-hidden transition-shadow hover:shadow-glow">
              {tile.hasImage && (
                <button
                  type="button"
                  className="relative block w-full overflow-hidden"
                  onClick={() => setIndex(withImages.indexOf(tile))}
                  aria-label={`Open ${tile.title}`}
                >
                  <img src={tile.src} alt={tile.title} loading="lazy" className="w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute inset-0 flex items-center justify-center bg-base/60 opacity-0 transition group-hover:opacity-100">
                    <span className="rounded-full border border-cyan/60 px-4 py-1.5 font-mono text-xs text-cyan">View</span>
                  </span>
                </button>
              )}
              <figcaption className="p-5">
                <p className="font-semibold text-white">{tile.title}</p>
                {tile.subtitle && <p className="mt-1 font-mono text-xs text-cyan">{tile.subtitle}</p>}
                {tile.description && <p className="mt-2 text-sm leading-relaxed text-slate-400">{tile.description}</p>}
                {tile.link && (
                  <a href={tile.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs text-cyan hover:underline">
                    {linkLabel(tile.link)}
                  </a>
                )}
              </figcaption>
            </figure>
          </ScrollScene>
        ))}
      </div>
      <Lightbox items={withImages} index={index} onClose={() => setIndex(null)} onIndexChange={setIndex} />
    </div>
  );
}

export default function Gallery({ certificates, extracurriculars }: Props) {
  const certTiles: Tile[] = certificates.map((c) => {
    const hasImage = isImage(c.imageUrl);
    return {
      key: `c-${c.id ?? c.title}`,
      src: c.imageUrl ?? '',
      hasImage,
      title: c.title,
      subtitle: [c.issuer, c.issueDate].filter(Boolean).join(' · ') || undefined,
      description: c.description,
      // A PDF upload is shown as its image already, so only offer the PDF when there's no image.
      // External verification links are always kept.
      link: hasImage && isPdf(c.credentialUrl) ? undefined : c.credentialUrl,
    };
  });
  const extraTiles: Tile[] = extracurriculars.map((x) => ({
    key: `x-${x.id ?? x.title}`,
    src: x.imageUrl ?? '',
    hasImage: isImage(x.imageUrl),
    title: x.title,
    subtitle: x.eventDate,
    description: x.description,
  }));

  return (
    <section id="gallery" className="section">
      <SectionHeading index="04" title="Certificates & Extracurriculars" />
      {certTiles.length > 0 && <MasonryGroup heading="Certificates" tiles={certTiles} />}
      {extraTiles.length > 0 && <MasonryGroup heading="Extracurriculars" tiles={extraTiles} />}
    </section>
  );
}
