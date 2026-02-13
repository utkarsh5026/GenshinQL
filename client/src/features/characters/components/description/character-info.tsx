import { ArrowRight } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
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
  <div className="flex items-center gap-3 mb-4">
    <h3 className="text-sm font-semibold uppercase tracking-wider text-starlight-300">
      {title}
    </h3>
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

/** Generates star string for rarity display */
const getRarityStars = (rarity: string) => {
  const numStars = Number.parseInt(rarity) || 5;
  return '★'.repeat(numStars);
};

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

interface IconBadgeProps {
  icon?: string;
  alt: string;
  text: string;
  style?: React.CSSProperties;
}

const IconBadge: React.FC<IconBadgeProps> = ({ icon, alt, text, style }) => (
  <Badge
    className={`inline-flex items-center gap-1.5 ${BASE_BADGE_CLASSES}`}
    style={style}
  >
    {icon && (
      <CachedImage src={icon} alt={alt} className="w-3 h-3 object-contain" />
    )}
    <span>{text}</span>
  </Badge>
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
            <span
              className="text-[10px] font-semibold"
              style={{ color: elementColor }}
            >
              4pc
            </span>
          </div>
        )}

        {config.type === '2pc+2pc' && (
          <>
            <div className="flex items-center gap-1">
              <ArtifactIcon
                setName={config.sets[0].name}
                artifactsData={artifactsData}
              />
              <span
                className="text-[10px] font-semibold"
                style={{ color: elementColor }}
              >
                2pc
              </span>
            </div>
            <span className="text-xs text-muted-foreground">+</span>
            <div className="flex items-center gap-1">
              <ArtifactIcon
                setName={config.sets[1].name}
                artifactsData={artifactsData}
              />
              <span
                className="text-[10px] font-semibold"
                style={{ color: elementColor }}
              >
                2pc
              </span>
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
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: elementColor }}
                  >
                    {set.pieces}pc
                  </span>
                </div>
              </React.Fragment>
            ))}
          </>
        )}
      </div>

      {/* Artifact Name - Compact */}
      <span className="text-xs text-starlight-300 flex-1 min-w-30">
        {config.sets.map((set) => set.name).join(' + ')}
      </span>

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
    <div className="space-y-4">
      {/* Stats and Farming Section */}
      <div>
        <SectionHeader title="Character Info" elementColor={elementColor} />
        <div className="space-y-3">
          {/* Stats Badges Row */}
          <div className="flex flex-wrap gap-2">
            {/* Rarity Badge */}
            <SimpleBadge
              text={getRarityStars(character.rarity)}
              className="text-celestial-400"
            />

            {/* Element Badge */}
            <IconBadge
              icon={elementIcon || character.elementUrl}
              alt={character.element}
              text={character.element}
              style={{ borderColor: `${elementColor}40`, color: elementColor }}
            />

            {/* Weapon Badge */}
            <IconBadge
              icon={weaponIcon || character.weaponUrl}
              alt={character.weaponType}
              text={character.weaponType}
            />

            {/* Region Badge */}
            <IconBadge
              icon={regionIcon || character.regionUrl}
              alt={character.region}
              text={character.region}
            />

            {/* Model Type Badge */}
            <SimpleBadge text={character.modelType} />

            {/* Version Badge */}
            {character.version && (
              <SimpleBadge text={`v${character.version}`} />
            )}

            {/* Farming Badge */}
            <FarmingBadge talentBook={talentBook} currentDay={currentDay} />
          </div>

          {/* Compact Build Display - Integrated */}
          {character.buildGuide && (
            <div className="pt-2 border-t border-midnight-600/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-starlight-400">
                  Recommended Build
                </span>
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
      </div>
    </div>
  );
};
