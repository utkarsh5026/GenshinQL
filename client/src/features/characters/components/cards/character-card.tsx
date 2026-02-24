import React, { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CachedImage, useLazyCachedAsset } from '@/features/cache';
import { useSharedIntersectionObserver } from '@/hooks/useSharedIntersectionObserver';
import {
  getElementAnimationClass,
  getElementBorderClass,
  getElementGlassClass,
  getElementGlowClass,
} from '@/lib/elementColors';
import { AnimationMedia } from '@/types';

import { Character } from '../../types';
import CharacterMediaAvatar from './character-media-avatar';
import styles from './CharacterCard.module.css';

interface CharacterCardProps {
  character: Character;
  index?: number;
  isMounted?: boolean;
  showAnimation?: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  index = 0,
  isMounted = true,
  showAnimation = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useSharedIntersectionObserver(cardRef, {
    rootMargin: '100px',
    threshold: 0.1,
  });

  const hasNamecard = !!character.namecardURL;
  const { url: namecardUrl, isLoading: namecardLoading } = useLazyCachedAsset(
    character.namecardURL,
    isVisible && hasNamecard
  );

  const staggerDelay = isMounted ? Math.min(index * 0.05, 0.8) : 0;

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
              cursor-pointer overflow-hidden
              ${elementClasses.border}
              ${elementClasses.glass}
              ${styles.cardHover}
              ${styles[elementClasses.glow]}
            `}
          >
            {/* Namecard Banner */}
            {hasNamecard && (
              <div className={styles.namecardBanner}>
                {namecardLoading ? (
                  <div className={styles.namecardSkeleton} />
                ) : (
                  <>
                    <img
                      src={namecardUrl}
                      alt=""
                      className={styles.namecardImage}
                      onError={(e) => {
                        (
                          e.currentTarget.parentElement as HTMLElement
                        ).style.display = 'none';
                      }}
                    />
                    <div className={styles.namecardOverlay} />
                  </>
                )}
              </div>
            )}

            <CardContent
              className={`p-4 ${hasNamecard ? styles.cardContent : ''} ${hasNamecard ? 'pt-16 md:pt-20' : ''}`}
            >
              {/* Mobile: Horizontal Layout, Desktop: Vertical Layout */}
              <div className="flex md:flex-col gap-4 md:gap-3 items-start md:items-center">
                {/* Character Avatar */}
                {showAnimation ? (
                  <CharacterMediaAvatar
                    media={characterMedia}
                    containerClassName={`h-24 w-24 md:h-28 md:w-28 shrink-0 ${hasNamecard ? 'ring-2 ring-background/50 rounded-full' : ''}`}
                    hoverScale={1.15}
                  />
                ) : (
                  <CachedImage
                    src={character.iconUrl}
                    alt={character.name}
                    width={112}
                    height={112}
                    className={`h-24 w-24 md:h-28 md:w-28 shrink-0 rounded-full object-cover ${hasNamecard ? 'ring-2 ring-background/50' : ''}`}
                  />
                )}

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
                    <InfoRow>
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
                    </InfoRow>

                    {/* Weapon Type */}
                    <InfoRow>
                      <ElementDisplay
                        element={character.weaponType}
                        elementUrl={character.weaponUrl}
                        size="sm"
                        showLabel={true}
                      />
                    </InfoRow>

                    {/* Region */}
                    <InfoRow>
                      <ElementDisplay
                        element={character.region}
                        elementUrl={character.regionUrl}
                        size="sm"
                        showLabel={true}
                      />
                    </InfoRow>

                    {/* Model Type Badge */}
                    <InfoRow>
                      <Badge variant="secondary" className="text-xs">
                        {character.modelType}
                      </Badge>
                    </InfoRow>

                    {/* Version Badge */}
                    <InfoRow>
                      <Badge variant="outline" className="text-xs">
                        v{character.version}
                      </Badge>
                    </InfoRow>
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

const InfoRow: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="flex items-center gap-2 md:justify-center">{children}</div>
);

type DisplaySize = 'sm' | 'md' | 'lg';

const SIZE_CONFIG: Record<
  DisplaySize,
  { container: string; icon: number; text: string }
> = {
  sm: { container: 'w-4 h-4', icon: 16, text: 'text-xs' },
  md: { container: 'w-6 h-6', icon: 24, text: 'text-sm' },
  lg: { container: 'w-8 h-8', icon: 32, text: 'text-base' },
} as const;

interface ElementDisplayProps {
  element: string;
  elementUrl: string;
  size?: DisplaySize;
  showLabel?: boolean;
}

const ElementDisplay: React.FC<ElementDisplayProps> = ({
  element,
  elementUrl,
  size = 'md',
  showLabel = true,
}) => {
  const { container, icon, text } = SIZE_CONFIG[size];

  return (
    <div className="flex items-center space-x-2">
      <CachedImage
        src={elementUrl}
        alt={element}
        width={icon}
        height={icon}
        className={`rounded-full ${container}`}
      />
      {showLabel && <span className={text}>{element}</span>}
    </div>
  );
};

interface RarityDisplayProps {
  rarity: string;
  size?: DisplaySize;
}

const RarityDisplay: React.FC<RarityDisplayProps> = ({
  rarity,
  size = 'md',
}) => {
  const rarityNum = Number.parseInt(rarity, 10);
  const starColor = rarityNum === 5 ? 'text-yellow-500' : 'text-violet-500';

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <div className="flex items-center justify-center">
      {Array.from({ length: rarityNum }).map((_, index) => (
        <span key={index} className={`${starColor} ${sizeClasses[size]}`}>
          ★
        </span>
      ))}
    </div>
  );
};
