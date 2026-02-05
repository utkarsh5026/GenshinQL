import React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { CachedImage } from '@/components/utils';
import { ImageUrl } from '@/types';

interface WeaponMaterialsProps {
  materials: ImageUrl[];
}

const WeaponMaterials: React.FC<WeaponMaterialsProps> = ({ materials }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Material Requirements</h2>
        <p className="text-sm text-gray-500">
          All materials needed for weapon ascension
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {materials.map((material, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-4 pb-2">
              <CachedImage
                src={material.url}
                alt={material.caption}
                className="w-20 h-20 mx-auto mb-2"
              />
              <p className="text-xs font-medium">{material.caption}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WeaponMaterials;
