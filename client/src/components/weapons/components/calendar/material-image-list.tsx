import React from 'react';

import { CachedImage } from '@/components/utils';

interface MaterialImage {
  url: string;
  caption: string;
}

interface MaterialImageListProps {
  materialImages: MaterialImage[];
}

const MaterialImageList: React.FC<MaterialImageListProps> = ({
  materialImages,
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      {materialImages.map((image) => (
        <div key={image.url} className="flex flex-col items-center">
          <CachedImage
            src={image.url}
            alt={image.caption}
            className="w-12 h-12 border border-white/10 rounded-lg p-1"
            lazy={true}
            showSkeleton={true}
            skeletonShape="rounded"
            skeletonSize="md"
          />
          <span className="text-[0.625rem] text-white/40 mt-1 text-center max-w-15 truncate">
            {image.caption}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MaterialImageList;
