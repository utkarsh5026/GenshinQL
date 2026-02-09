import React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { CachedImage } from '@/features/cache';
import { ImageUrl } from '@/types';

interface WeaponMaterialsProps {
  materials: ImageUrl[];
}

const WeaponMaterials: React.FC<WeaponMaterialsProps> = ({ materials }) => {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-lg md:text-xl font-semibold mb-1.5 md:mb-2">
          Material Requirements
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground">
          All materials needed for weapon ascension
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {materials.map((material, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-3 md:pt-4 pb-2">
              <CachedImage
                src={material.url}
                alt={material.caption}
                className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-1.5 md:mb-2"
              />
              <p className="text-[0.625rem] md:text-xs font-medium leading-tight">
                {material.caption}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WeaponMaterials;
