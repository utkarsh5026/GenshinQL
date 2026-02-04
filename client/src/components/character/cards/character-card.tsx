import React, { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useSharedIntersectionObserver } from '@/hooks/useSharedIntersectionObserver';
import {
  getElementAnimationClass,
  getElementBorderClass,
  getElementGlassClass,
  getElementGlowClass,
} from '@/lib/elementColors';
import { AnimationMedia, Character } from '@/types';

import { ElementDisplay, RarityDisplay } from '../utils/DisplayComponents';
import CharacterMediaAvatar from './character-media-avatar';
import styles from './CharacterCard.module.css';

interface CharacterCardProps {
  character: Character;
  index?: number;
  isMounted?: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  index = 0,
  isMounted = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useSharedIntersectionObserver(cardRef, {
    rootMargin: '100px',
    threshold: 0.1,
  });

  const staggerDelay = isMounted ? Math.min(index * 0.05, 0.8) : 0;

  // Memoize class calculations to avoid recalculating on every render
  const elementClasses = useMemo(
    () => ({
      border: getElementBorderClass(character.element),
      glass: getElementGlassClass(character.element),
      glow: getElementGlowClass(character.element),
      animation: getElementAnimationClass(character.element),
    }),
    [character.element]
  );

  const characterMedia: AnimationMedia = useMemo(() => {
    if (character.partyJoin) return character.partyJoin;
    if (character.idleOne) return character.idleOne;
    if (character.idleTwo) return character.idleTwo;

    return {
      imageUrl: character.iconUrl,
      videoUrl: '',
      caption: character.name,
      videoType: '',
    };
  }, [character]);

  return (
    <Link to={`/characters/${character.name}`} className="block no-underline">
      <div ref={cardRef}>
        <div
          className={`${styles.cardFadeIn} ${isVisible ? styles.visible : ''}`}
          style={{
            animationDelay: `${staggerDelay}s`,
          }}
        >
          <Card
            className={`
              cursor-pointer
              ${elementClasses.border}
              ${elementClasses.glass}
              ${styles.cardHover}
              ${styles[elementClasses.glow]}
            `}
          >
            <CardContent className="p-4">
              {/* Mobile: Horizontal Layout, Desktop: Vertical Layout */}
              <div className="flex md:flex-col gap-4 md:gap-3 items-start md:items-center">
                {/* Character Avatar */}
                <CharacterMediaAvatar
                  media={characterMedia}
                  containerClassName="h-24 w-24 md:h-28 md:w-28 shrink-0"
                  hoverScale={1.15}
                />

                {/* Character Info */}
                <div className="flex-1 md:w-full space-y-2 md:space-y-3">
                  {/* Name and Rarity */}
                  <div className="md:text-center">
                    <h3 className="font-bold text-base md:text-lg line-clamp-2 mb-1">
                      {character.name}
                    </h3>
                    <RarityDisplay rarity={character.rarity} size="sm" />
                  </div>

                  {/* Info Grid - 2 columns on mobile, single column centered on desktop */}
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {/* Element */}
                    <div className="flex items-center gap-2 md:justify-center">
                      <div
                        className={`${styles.elementIcon} ${styles[elementClasses.animation]}`}
                      >
                        <ElementDisplay
                          element={character.element}
                          elementUrl={character.elementUrl}
                          size="sm"
                          showLabel={true}
                        />
                      </div>
                    </div>

                    {/* Weapon Type */}
                    <div className="flex items-center gap-2 md:justify-center">
                      <ElementDisplay
                        element={character.weaponType}
                        elementUrl={character.weaponUrl}
                        size="sm"
                        showLabel={true}
                      />
                    </div>

                    {/* Region */}
                    <div className="flex items-center gap-2 md:justify-center">
                      <ElementDisplay
                        element={character.region}
                        elementUrl={character.regionUrl}
                        size="sm"
                        showLabel={true}
                      />
                    </div>

                    {/* Model Type Badge */}
                    <div className="flex items-center gap-2 md:justify-center">
                      <Badge variant="secondary" className="text-xs">
                        {character.modelType}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(CharacterCard, (prevProps, nextProps) => {
  return (
    prevProps.character.name === nextProps.character.name &&
    prevProps.index === nextProps.index
  );
});
