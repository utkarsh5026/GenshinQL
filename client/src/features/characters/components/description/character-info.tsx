import { ArrowRight } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  ElementBadge,
  NationBadge,
  RarityStars,
  WeaponTypeBadge,
} from '@/components/ui/genshin-game-icons';
import { Heading, Text } from '@/components/ui/text';
import { CachedImage } from '@/features/cache';
import { useTalentCharMap } from '@/features/calendar/stores/useTalentBooksStore';
import type { TalentBook } from '@/features/calendar/types';
import { getCurrentDayName } from '@/features/home/utils';
import { usePrimitives } from '@/stores/usePrimitivesStore';

import { useArtifactLinks, useFetchArtifactLinks } from '../../stores';
import type {
  ArtifactLink,
  CharacterDetailed,
  CharacterMenuItem,
} from '../../types';
import {
  detectArtifactSetConfiguration,
  getArtifactIconUrl,
} from '../../utils/artifact-utils';

interface CharacterStatsCompactProps {
  character: CharacterDetailed;
  elementColor: string;
  onNavigate: (menuItem: CharacterMenuItem) => void;
}

interface SectionHeaderProps {
  title: string;
  elementColor?: string;
}

/** Section Header for Profile */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  elementColor,
}) => (
  <div className="flex items-center gap-3 mb-2 sm:mb-4">
    <Heading
      level={3}
      size="sm"
      weight="semibold"
      uppercase
      className="tracking-wider text-starlight-300"
    >
      {title}
    </Heading>
    <div
      className="flex-1 h-px"
      style={{
        background: elementColor
          ? `linear-gradient(to right, ${elementColor}40, transparent)`
          : 'linear-gradient(to right, rgba(255,255,255,0.1), transparent)',
      }}
    />
  </div>
);

/** Base badge styling constant */
const BASE_BADGE_CLASSES =
  'px-2.5 py-1 text-xs text-foreground font-medium rounded-full border bg-midnight-800/30 border-midnight-600/40 hover:bg-card';

interface SimpleBadgeProps {
  text: string;
  className?: string;
}

const SimpleBadge: React.FC<SimpleBadgeProps> = ({ text, className = '' }) => (
  <Badge className={`${BASE_BADGE_CLASSES} ${className}`}>{text}</Badge>
);

/** Farming Badge Component - Shows talent material availability */
interface FarmingBadgeProps {
  talentBook: TalentBook | undefined;
  currentDay: string;
}

const FarmingBadge: React.FC<FarmingBadgeProps> = ({
  talentBook,
  currentDay,
}) => {
  const isFarmableToday = useMemo(() => {
    if (!talentBook) return false;

    const isSunday = currentDay === 'Sunday';
    if (isSunday) return true;

    return talentBook.dayOne === currentDay || talentBook.dayTwo === currentDay;
  }, [talentBook, currentDay]);

  if (!talentBook) {
    return null;
  }

  return (
    <Badge
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
        isFarmableToday
          ? 'bg-green-500/20 border-green-500/50 text-green-400'
          : 'bg-midnight-800/30 border-midnight-600/40 text-muted-foreground'
      }`}
    >
      <CachedImage
        src={talentBook.philosophyUrl}
        alt="Talent Material"
        className="w-3.5 h-3.5 object-contain"
      />
      <span>
        {isFarmableToday
          ? 'Farmable Today'
          : `${talentBook.dayOne}/${talentBook.dayTwo}`}
      </span>
    </Badge>
  );
};

interface CompactBuildDisplayProps {
  characterName: string;
  elementColor: string;
  onNavigate: (menuItem: CharacterMenuItem) => void;
  buildData: CharacterDetailed['buildGuide'];
}

/** Artifact Icon Component */
interface ArtifactIconProps {
  setName: string;
  artifactsData: readonly ArtifactLink[];
}

const ArtifactIcon: React.FC<ArtifactIconProps> = ({
  setName,
  artifactsData,
}) => {
  const iconUrl = getArtifactIconUrl(setName, artifactsData);

  if (!iconUrl) {
    return (
      <div className="w-8 h-8 rounded bg-midnight-700 flex items-center justify-center text-[9px] font-bold text-muted-foreground border border-midnight-600">
        {setName.substring(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <CachedImage
      src={iconUrl}
      alt={setName}
      className="w-8 h-8 rounded-2xl object-cover border border-midnight-600/50"
    />
  );
};

const CompactBuildDisplay: React.FC<CompactBuildDisplayProps> = ({
  characterName,
  elementColor,
  onNavigate,
  buildData,
}) => {
  const artifactsData = useArtifactLinks();
  const fetchArtifactLinks = useFetchArtifactLinks();

  useEffect(() => {
    fetchArtifactLinks();
  }, [characterName, fetchArtifactLinks]);

  if (!buildData || !buildData.artifacts.recommended) {
    return null;
  }

  const recommended = buildData.artifacts.recommended;
  const config = detectArtifactSetConfiguration(recommended.sets);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Artifact Icons - Compact */}
      <div className="flex items-center gap-2">
        {config.type === '4pc' && (
          <div className="flex items-center gap-1">
            <ArtifactIcon
              setName={config.sets[0].name}
              artifactsData={artifactsData}
            />
            <Text
              as="span"
              weight="semibold"
              className="text-[10px]"
              style={{ color: elementColor }}
            >
              4pc
            </Text>
          </div>
        )}

        {config.type === '2pc+2pc' && (
          <>
            <div className="flex items-center gap-1">
              <ArtifactIcon
                setName={config.sets[0].name}
                artifactsData={artifactsData}
              />
              <Text
                as="span"
                weight="semibold"
                className="text-[10px]"
                style={{ color: elementColor }}
              >
                2pc
              </Text>
            </div>
            <span className="text-xs text-muted-foreground">+</span>
            <div className="flex items-center gap-1">
              <ArtifactIcon
                setName={config.sets[1].name}
                artifactsData={artifactsData}
              />
              <Text
                as="span"
                weight="semibold"
                className="text-[10px]"
                style={{ color: elementColor }}
              >
                2pc
              </Text>
            </div>
          </>
        )}

        {config.type === 'mixed' && (
          <>
            {config.sets.map((set, index) => (
              <React.Fragment key={set.name}>
                {index > 0 && (
                  <span className="text-xs text-muted-foreground">+</span>
                )}
                <div className="flex items-center gap-1">
                  <ArtifactIcon
                    setName={set.name}
                    artifactsData={artifactsData}
                  />
                  <Text
                    as="span"
                    weight="semibold"
                    className="text-[10px]"
                    style={{ color: elementColor }}
                  >
                    {set.pieces}pc
                  </Text>
                </div>
              </React.Fragment>
            ))}
          </>
        )}
      </div>

      {/* Artifact Name - Compact */}
      <Text as="span" size="xs" className="text-starlight-300 flex-1 min-w-30">
        {config.sets.map((set) => set.name).join(' + ')}
      </Text>

      {/* View Button - Compact */}
      <button
        onClick={() => onNavigate('Builds')}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all hover:gap-2"
        style={{
          backgroundColor: `${elementColor}15`,
          color: elementColor,
          border: `1px solid ${elementColor}30`,
        }}
      >
        Details
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};

export const CharacterStatsCompact: React.FC<CharacterStatsCompactProps> = ({
  character,
  elementColor,
  onNavigate,
}) => {
  const primitives = usePrimitives();
  const talentCharMap = useTalentCharMap();
  const currentDay = getCurrentDayName();

  // Get icons from primitives
  const elementIcon = primitives?.elements.find(
    (e) => e.name.toLowerCase() === character.element.toLowerCase()
  )?.url;
  const weaponIcon = primitives?.weaponTypes.find(
    (w) => w.name.toLowerCase() === character.weaponType.toLowerCase()
  )?.url;
  const regionIcon = primitives?.regions.find(
    (r) => r.name.toLowerCase() === character.region.toLowerCase()
  )?.url;

  const talentBook = talentCharMap[character.name];

  return (
    <div className="space-y-6">
      {/* Character Info Section */}
      <div>
        <SectionHeader title="Character Info" elementColor={elementColor} />

        <div className="space-y-5">
          {/* Rarity */}
          <div className="flex flex-col gap-1.5">
            <Text
              as="span"
              size="xs"
              className="text-muted-foreground uppercase tracking-wider"
            >
              Rarity
            </Text>
            <RarityStars
              rarity={character.rarity}
              showGlow
              size="md"
              className="self-start"
            />
          </div>

          {/* Element & Weapon */}
          <div className="flex flex-col gap-1.5">
            <Text
              as="span"
              size="xs"
              className="text-muted-foreground uppercase tracking-wider"
            >
              Element &amp; Weapon
            </Text>
            <div className="flex flex-wrap gap-2">
              <ElementBadge
                name={character.element}
                url={elementIcon ?? character.elementUrl}
                size="md"
              />
              <WeaponTypeBadge
                name={character.weaponType}
                url={weaponIcon ?? character.weaponUrl}
                size="md"
              />
            </div>
          </div>

          {/* Origin & Model */}
          <div className="flex flex-col gap-1.5">
            <Text
              as="span"
              size="xs"
              className="text-muted-foreground uppercase tracking-wider"
            >
              Origin &amp; Model
            </Text>
            <div className="flex flex-wrap gap-2">
              <NationBadge
                name={character.region}
                url={regionIcon ?? character.regionUrl}
                size="md"
              />
              <SimpleBadge text={character.modelType} />
              {character.version && (
                <SimpleBadge text={`v${character.version}`} />
              )}
            </div>
          </div>

          {/* Farming Availability */}
          {talentBook && (
            <div className="flex flex-col gap-1.5">
              <Text
                as="span"
                size="xs"
                className="text-muted-foreground uppercase tracking-wider"
              >
                Talent Materials
              </Text>
              <FarmingBadge talentBook={talentBook} currentDay={currentDay} />
            </div>
          )}
        </div>
      </div>

      {/* Recommended Build Section */}
      {character.buildGuide && (
        <div
          className="rounded-lg p-4 border border-midnight-600/40 bg-midnight-800/20"
          style={{ borderColor: `${elementColor}20` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Text
              as="span"
              size="xs"
              weight="semibold"
              uppercase
              className="tracking-wider text-starlight-300"
            >
              Recommended Build
            </Text>
            <div
              className="flex-1 h-px"
              style={{
                background: elementColor
                  ? `linear-gradient(to right, ${elementColor}30, transparent)`
                  : 'linear-gradient(to right, rgba(255,255,255,0.08), transparent)',
              }}
            />
          </div>
          <CompactBuildDisplay
            characterName={character.name}
            elementColor={elementColor}
            onNavigate={onNavigate}
            buildData={character.buildGuide}
          />
        </div>
      )}
    </div>
  );
};
