import { X } from 'lucide-react';
import React from 'react';

import { CachedImage } from '@/components/utils/CachedImage';

interface FilterChipProps {
  label: string;
  icon?: string;
  type: 'element' | 'rarity' | 'region';
  onRemove: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  icon,
  type,
  onRemove,
}) => {
  const renderRarityStars = () => {
    const rarityNum = Number.parseInt(label, 10);
    const starColor = rarityNum === 5 ? 'text-yellow-500' : 'text-violet-500';

    return (
      <div className="flex items-center">
        {Array.from({ length: rarityNum }).map((_, index) => (
          <span key={index} className={`${starColor} text-sm`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm border border-primary/20 hover:bg-primary/15 transition-colors">
      {icon && (
        <CachedImage
          src={icon}
          alt={label}
          width={16}
          height={16}
          className="w-4 h-4 rounded-full"
        />
      )}

      {/* Rarity stars */}
      {type === 'rarity' ? renderRarityStars() : <span>{label}</span>}

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
        type="button"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};

export default FilterChip;
