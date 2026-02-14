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

      <div className="relative flex items-start gap-3 p-4 md:gap-4 md:p-5">
        {/* Character Icon */}
        <div
          className={`shrink-0 overflow-hidden rounded-full border-2 ${elementBorder} bg-midnight-900/60`}
        >
          <img
            src={character.icon}
            alt={name}
            className="h-16 w-16 object-cover transition-transform duration-300 group-hover:scale-110 md:h-20 md:w-20"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-1.5 md:space-y-2">
          <h3 className="text-base font-bold text-foreground md:text-lg">
            {name}
          </h3>

          {character.description && (
            <p className="text-xs italic text-muted-foreground md:text-sm">
              &ldquo;{character.description}&rdquo;
            </p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 md:gap-2">
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
                className={`h-3 w-3 fill-current md:h-3.5 md:w-3.5 ${rarityText}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
