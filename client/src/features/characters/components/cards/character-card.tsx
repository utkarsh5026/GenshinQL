import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/text';
import { CachedImage, useLazyCachedAsset } from '@/features/cache';
import {
  getElementAnimationClass,
  getElementGlassClass,
  getElementGlowClass,
} from '@/lib/elementColors';
import { cn } from '@/lib/utils';
import { AnimationMedia } from '@/types';

import { Character } from '../../types';
import CharacterMediaAvatar from './character-media-avatar';
import styles from './CharacterCard.module.css';

interface CharacterCardProps {
  character: Character;
  showAnimation?: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  showAnimation = false,
}) => {
  const hasNamecard = !!character.namecardURL;
  const { url: namecardUrl, isLoading: namecardLoading } = useLazyCachedAsset(
    character.namecardURL,
    hasNamecard
  );

  const elementClasses = useMemo(
    () => ({
      glass: getElementGlassClass(character.element),
      glow: getElementGlowClass(character.element),
      animation: getElementAnimationClass(character.element),
    }),
    [character.element]
  );

  const rarityNum = Number.parseInt(character.rarity, 10);
  const is5star = rarityNum >= 5;

  const rarityClasses = useMemo(
    () => ({
      avatarRing: is5star
        ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background'
        : 'ring-2 ring-violet-400 ring-offset-2 ring-offset-background',
      cardGlow: is5star ? styles.fiveStarGlow : styles.fourStarGlow,
      starColor: is5star ? 'text-yellow-400' : 'text-violet-400',
      starGlow: is5star
        ? 'drop-shadow-[0_0_4px_rgba(250,204,21,0.7)]'
        : 'drop-shadow-[0_0_4px_rgba(167,139,250,0.7)]',
    }),
    [is5star]
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

  const elementTintClass = styles[`${character.element.toLowerCase()}Tint`];

  return (
    <Link to={`/characters/${character.name}`} className="block no-underline">
      <Card
        className={cn(
          'cursor-pointer overflow-hidden relative',
          elementClasses.glass,
          styles.cardHover,
          styles[elementClasses.glow],
          rarityClasses.cardGlow
        )}
      >
        {/* Namecard Banner */}
        <div className="absolute inset-x-0 top-0 h-32.5 overflow-hidden z-0 pointer-events-none">
          {hasNamecard ? (
            namecardLoading ? (
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
                <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-transparent via-black/20 to-black/65" />
              </>
            )
          ) : (
            <div className={cn('w-full h-full', elementTintClass)} />
          )}
        </div>

        {/* Avatar */}
        {/* top-[90px]: banner 130px - half avatar 40px = 90px */}
        <div className="absolute top-22.5 left-1/2 -translate-x-1/2 z-2">
          <div className={`rounded-full ${rarityClasses.avatarRing}`}>
            {showAnimation ? (
              <CharacterMediaAvatar
                media={characterMedia}
                containerClassName="h-20 w-20 rounded-full"
                hoverScale={1.1}
              />
            ) : (
              <CachedImage
                src={character.iconUrl}
                alt={character.name}
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="relative z-1 pt-44 pb-4 px-4">
          <Heading
            level={3}
            size="base"
            weight="bold"
            align="center"
            truncate
            className="mb-1"
          >
            {character.name}
          </Heading>

          {/* Rarity stars */}
          <div className="flex items-center justify-center gap-px mb-3">
            {Array.from({ length: rarityNum }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'text-sm leading-none',
                  rarityClasses.starColor,
                  rarityClasses.starGlow
                )}
              >
                ★
              </span>
            ))}
          </div>

          {/* Info chips */}
          <div className="flex flex-col items-center gap-1.5 mb-2">
            <div className="flex gap-1.5">
              <div
                className={cn(
                  styles.elementIcon,
                  elementClasses.animation && styles[elementClasses.animation]
                )}
              >
                <InfoChip
                  iconUrl={character.elementUrl}
                  label={character.element}
                />
              </div>
              <InfoChip
                iconUrl={character.weaponUrl}
                label={character.weaponType}
              />
            </div>
            <InfoChip iconUrl={character.regionUrl} label={character.region} />
          </div>

          {/* Model type · Version */}
          <Text size="xs" color="muted" align="center">
            {character.modelType} · v{character.version}
          </Text>
        </CardContent>
      </Card>
    </Link>
  );
};

export default React.memo(CharacterCard, (prevProps, nextProps) => {
  return prevProps.character.name === nextProps.character.name;
});

interface InfoChipProps {
  iconUrl: string;
  label: string;
}

const InfoChip: React.FC<InfoChipProps> = ({ iconUrl, label }) => (
  <div className="flex items-center gap-1 bg-muted/60 rounded-full px-2 py-0.5">
    <CachedImage
      src={iconUrl}
      alt={label}
      width={14}
      height={14}
      className="w-3.5 h-3.5 rounded-full shrink-0"
    />
    <Text as="span" size="xs" color="muted" truncate className="max-w-15">
      {label}
    </Text>
  </div>
);
