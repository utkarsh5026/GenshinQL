import { Star } from 'lucide-react';
import { useMemo } from 'react';

import type { VersionCharacter } from '../../types';
import {
  getElementBadgeClass,
  getElementBgClass,
  getElementBorderClass,
  getRarityBorderClass,
  getRarityTextClass,
  stripSoftHyphens,
} from '../../utils';

interface CharacterCardProps {
  character: VersionCharacter;
}

export default function CharacterCard({ character }: CharacterCardProps) {
  const name = useMemo(
    () => stripSoftHyphens(character.name),
    [character.name]
  );

  const rarityCount = character.rarity?.startsWith('5') ? 5 : 4;
  const elementBg = getElementBgClass(character.element);
  const elementBorder = getElementBorderClass(character.element);
  const rarityBorder = getRarityBorderClass(character.rarity);
  const rarityText = getRarityTextClass(character.rarity);
  const elementBadge = getElementBadgeClass(character.element);

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border-2 ${rarityBorder} ${elementBg} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-midnight-950/50`}
      style={{ transform: 'translate3d(0,0,0)' }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-transparent via-transparent to-midnight-950/40" />

      <div className="relative flex items-start gap-4 p-5">
        {/* Character Icon */}
        <div
          className={`shrink-0 overflow-hidden rounded-full border-2 ${elementBorder} bg-midnight-900/60`}
        >
          <img
            src={character.icon}
            alt={name}
            className="h-20 w-20 object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-lg font-bold text-foreground">{name}</h3>

          {character.description && (
            <p className="text-sm italic text-muted-foreground">
              &ldquo;{character.description}&rdquo;
            </p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {character.element && (
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${elementBadge}`}
              >
                {character.element}
              </span>
            )}
            {character.weaponType && (
              <span className="inline-flex items-center rounded-md border border-starlight-500/30 bg-starlight-900/50 px-2 py-0.5 text-xs font-medium text-starlight-200">
                {character.weaponType}
              </span>
            )}
          </div>

          {/* Rarity Stars */}
          <div className="flex gap-0.5">
            {Array.from({ length: rarityCount }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 fill-current ${rarityText}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
