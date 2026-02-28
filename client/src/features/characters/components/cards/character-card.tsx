import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  ElementBadge,
  NationBadge,
  RarityStars,
  RoleBadges,
  WeaponTypeBadge,
} from '@/components/ui/genshin-game-icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Heading, Text } from '@/components/ui/text';
import { CachedImage, useLazyCachedAsset } from '@/features/cache';
import { useSharedIntersectionObserver } from '@/hooks/useSharedIntersectionObserver';
import {
  getElementAnimationClass,
  getElementGlassClass,
  getElementGlowClass,
} from '@/lib/elementColors';
import { cn } from '@/lib/utils';
import { AnimationMedia } from '@/types';

import { Character } from '../../types';
import styles from './character-card.module.css';

interface CharacterMediaAvatarProps {
  media: AnimationMedia;
  containerClassName?: string;
  hoverScale?: number;
}

const CharacterMediaAvatar: React.FC<CharacterMediaAvatarProps> = ({
  media,
  containerClassName,
  hoverScale = 1.2,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isVisible = useSharedIntersectionObserver(containerRef, {
    rootMargin: '200px',
  });

  const { url: cachedFallbackUrl, isLoading: fallbackLoading } =
    useLazyCachedAsset(media.fallbackUrl || media.imageUrl, isVisible);

  const { url: cachedImageUrl } = useLazyCachedAsset(
    media.imageUrl,
    isVisible && !!media.fallbackUrl
  );

  const { url: cachedVideoUrl } = useLazyCachedAsset(
    media.videoUrl,
    isVisible && isHovered
  );

  if (fallbackLoading) {
    return (
      <div ref={containerRef} className={cn('relative', containerClassName)}>
        <Skeleton className="h-full w-full rounded-full" />
      </div>
    );
  }

  const displayImageUrl = cachedImageUrl || cachedFallbackUrl;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative',
        isHovered && 'overflow-visible',
        containerClassName
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsVideoLoaded(false);
      }}
    >
      <Avatar
        className="relative h-full w-full cursor-pointer transition-transform duration-300 ease-in-out"
        style={{
          transform: isHovered
            ? `scale3d(${hoverScale}, ${hoverScale}, 1)`
            : 'scale3d(1, 1, 1)',
          willChange: 'transform',
        }}
      >
        <AvatarImage
          src={displayImageUrl}
          alt={media.caption}
          loading="lazy"
          className="h-full w-full"
        />
        {isHovered && cachedVideoUrl && (
          <video
            src={cachedVideoUrl}
            autoPlay
            loop
            muted
            className={cn(
              'absolute inset-0 h-full w-full object-cover rounded-full transition-opacity duration-300',
              isVideoLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onCanPlayThrough={() => setIsVideoLoaded(true)}
          />
        )}
      </Avatar>
    </div>
  );
};

interface CharacterCardProps {
  character: Character;
  showAnimation?: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  showAnimation = false,
}) => {
  const hasNamecard = !!character.namecardURL;

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
        className={cn('cursor-pointer overflow-hidden relative border-none')}
      >
        {/* Namecard Banner */}
        <div className="absolute inset-x-0 top-0 h-32.5 overflow-hidden z-0 pointer-events-none">
          {hasNamecard ? (
            <>
              <CachedImage
                src={character.namecardURL}
                alt=""
                className={styles.namecardImage}
                style={{ width: '100%', height: '100%', display: 'block' }}
                skeletonShape="rounded"
                onError={(e) => {
                  const container = e.currentTarget.parentElement
                    ?.parentElement as HTMLElement;
                  if (container) container.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-transparent from-10% via-black/25 via-55% to-black/80" />
            </>
          ) : (
            <div className={cn('w-full h-full', elementTintClass)} />
          )}
        </div>

        {/* Ambient element-color bleed — namecard into card body */}
        <div
          className={cn(
            'absolute inset-x-0 pointer-events-none z-1',
            styles.namecardAmbient,
            elementTintClass
          )}
        />

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
          <RarityStars
            rarity={rarityNum}
            showGlow
            className="justify-center mb-3"
          />

          {/* Info chips */}
          <div className="flex flex-col items-center gap-1.5 mb-2">
            <div className="flex gap-1.5">
              <div
                className={cn(
                  styles.elementIcon,
                  elementClasses.animation && styles[elementClasses.animation]
                )}
              >
                <ElementBadge
                  name={character.element}
                  url={character.elementUrl}
                />
              </div>
              <WeaponTypeBadge
                name={character.weaponType}
                url={character.weaponUrl}
              />
            </div>
            <NationBadge name={character.region} url={character.regionUrl} />
          </div>

          {/* Model type · Version */}
          <Text size="xs" color="muted" align="center">
            {character.modelType} · v{character.version}
          </Text>

          {/* Role badges */}
          {character.roles && character.roles.length > 0 && (
            <RoleBadges roles={character.roles} />
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default React.memo(CharacterCard, (prevProps, nextProps) => {
  return prevProps.character.name === nextProps.character.name;
});
