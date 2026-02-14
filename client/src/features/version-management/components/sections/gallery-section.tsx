import { Image } from 'lucide-react';
import { useMemo } from 'react';

import { useVersionGallery } from '../../stores';
import { stripSoftHyphens } from '../../utils';
import SectionContainer from '../section-container';

export default function GallerySection() {
  const gallery = useVersionGallery();

  // Skip first image since it's used as the hero wallpaper
  const galleryImages = useMemo(() => gallery.slice(1), [gallery]);

  if (galleryImages.length === 0) return null;

  return (
    <SectionContainer id="gallery" title="Gallery" icon={Image}>
      <div className="columns-1 gap-3 md:columns-2 md:gap-4 lg:columns-3">
        {galleryImages.map((image, index) => (
          <div
            key={index}
            className="group relative mb-3 break-inside-avoid overflow-hidden rounded-xl border border-midnight-700/50 transition-all duration-300 hover:border-celestial-500/30 hover:shadow-lg hover:shadow-midnight-950/50 md:mb-4"
          >
            <img
              src={image.url}
              alt={image.caption}
              className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              style={{ transform: 'translate3d(0,0,0)' }}
            />
            {image.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-midnight-950/80 to-transparent p-3 pt-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="text-sm text-celestial-200">
                  {stripSoftHyphens(image.caption)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
