import React from 'react';

import { CachedImage } from '@/features/cache';

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
      {materialImages.map(({ url, caption }) => (
        <div key={url} className="flex flex-col items-center">
          <CachedImage
            src={url}
            alt={caption}
            className="w-12 h-12 border border-border rounded-lg p-1"
            lazy={true}
            showSkeleton={true}
            skeletonShape="rounded"
            skeletonSize="md"
          />
          <span className="text-[0.625rem] text-muted-foreground mt-1 text-center max-w-15 truncate">
            {caption}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MaterialImageList;
