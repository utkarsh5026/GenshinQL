import { Clock, Zap } from 'lucide-react';
import React, { useState } from 'react';

import { Card } from '@/components/ui/card.tsx';
import { AnimatedCover } from '@/components/utils/AnimatedCover.tsx';
import { CachedImage } from '@/components/utils/CachedImage.tsx';
import { usePrimitives } from '@/stores/usePrimitivesStore.ts';
import { AnimationMedia, CharacterDetailed } from '@/types';
import { decideColor } from '@/utils/color.ts';

import CharacterAttackAnimations from '../attack/CharacterAttackAnimations.tsx';
import CharacterRoutineDetailed from '../routine/CharacterRoutineDetailed.tsx';
import CharacterTalentTable from '../talents/CharacterTalentTable.tsx';
import CharacterConstellations from './constellations.tsx';
import CharacterPassives from './passives.tsx';
import ProfileHeader from './profile-header.tsx';

interface CharacterDetailedProps {
  character: CharacterDetailed | null;
}

type CharacterMenuItem =
  | 'Profile'
  | 'Talents'
  | 'Constellations'
  | 'Passives'
  | 'Attacks'
  | 'Routine';

const menuItems: CharacterMenuItem[] = [
  'Profile',
  'Talents',
  'Constellations',
  'Passives',
  'Attacks',
  'Routine',
];

/**
 * Returns element-specific Tailwind classes for menu items based on character element
 */
const getElementClasses = (element: string) => {
  const elementLower = element.toLowerCase();
  const elementClassMap: Record<string, { active: string; indicator: string }> =
    {
      anemo: {
        active:
          'bg-linear-to-r from-anemo-500/20 via-anemo-400/15 to-transparent text-anemo-300 border-anemo-500/40',
        indicator: 'bg-anemo-400',
      },
      pyro: {
        active:
          'bg-linear-to-r from-pyro-500/20 via-pyro-400/15 to-transparent text-pyro-300 border-pyro-500/40',
        indicator: 'bg-pyro-400',
      },
      hydro: {
        active:
          'bg-linear-to-r from-hydro-500/20 via-hydro-400/15 to-transparent text-hydro-300 border-hydro-500/40',
        indicator: 'bg-hydro-400',
      },
      electro: {
        active:
          'bg-linear-to-r from-electro-500/20 via-electro-400/15 to-transparent text-electro-300 border-electro-500/40',
        indicator: 'bg-electro-400',
      },
      cryo: {
        active:
          'bg-linear-to-r from-cryo-500/20 via-cryo-400/15 to-transparent text-cryo-300 border-cryo-500/40',
        indicator: 'bg-cryo-400',
      },
      geo: {
        active:
          'bg-linear-to-r from-geo-500/20 via-geo-400/15 to-transparent text-geo-300 border-geo-500/40',
        indicator: 'bg-geo-400',
      },
      dendro: {
        active:
          'bg-linear-to-r from-dendro-500/20 via-dendro-400/15 to-transparent text-dendro-300 border-dendro-500/40',
        indicator: 'bg-dendro-400',
      },
    };

  return (
    elementClassMap[elementLower] || {
      active:
        'bg-linear-to-r from-celestial-500/20 via-celestial-400/15 to-transparent text-celestial-300 border-celestial-500/40',
      indicator: 'bg-celestial-400',
    }
  );
};

/** Generates star string for rarity display */
const getRarityStars = (rarity: string) => {
  const numStars = parseInt(rarity) || 5;
  return '★'.repeat(numStars);
};

const CharacterDescription: React.FC<CharacterDetailedProps> = ({
  character,
}) => {
  const [selectedMenuItem, setSelectedMenuItem] =
    useState<CharacterMenuItem>('Profile');

  console.log('CharacterDescription rendered with character:', character);
  if (!character)
    return (
      <div className="flex items-center justify-center h-[90vh] text-muted-foreground bg-card/50 rounded-lg border border-border">
        Character not found
      </div>
    );

  const elementColor = decideColor(character.element);
  const elementClasses = getElementClasses(character.element);

  return (
    <div
      className="relative flex flex-col h-[90vh] overflow-auto rounded-xl scrollbar-hide bg-linear-to-br from-midnight-900/90 via-midnight-800/80 to-midnight-900/90 backdrop-blur-sm"
      style={{
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: elementColor,
        boxShadow: `0 0 20px ${elementColor}25, inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {/* Background namecard with subtle overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${character.imageUrls.nameCard})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.08,
        }}
      />

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 z-0 bg-linear-to-t from-midnight-950/80 via-transparent to-midnight-900/50" />

      <div className="relative z-10 flex gap-6 p-5 h-full">
        <div className="w-64 shrink-0 flex flex-col gap-4">
          <ProfileHeader
            name={character.name}
            avatarUrl={character.iconUrl}
            idleOne={character.screenAnimation?.idleOne}
            idleTwo={character.screenAnimation?.idleTwo}
            fallbackCoverUrl={character.imageUrls.nameCard}
          />

          {/* Menu Navigation */}
          <nav className="flex flex-col gap-1.5 mt-2">
            {menuItems.map((item) => {
              const isActive = selectedMenuItem === item;
              return (
                <button
                  onClick={() => setSelectedMenuItem(item)}
                  key={item}
                  className={`
                    relative w-full text-left text-sm font-medium rounded-lg px-4 py-2.5
                    transition-all duration-300 ease-out
                    border border-transparent
                    ${
                      isActive
                        ? elementClasses.active
                        : 'text-starlight-400 hover:text-starlight-200 hover:bg-midnight-700/50 hover:border-starlight-600/20'
                    }
                  `}
                  style={
                    isActive
                      ? {
                          boxShadow: `0 0 12px ${elementColor}20`,
                        }
                      : undefined
                  }
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-full ${elementClasses.indicator}`}
                    />
                  )}
                  {item}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 min-w-0 overflow-auto h-[calc(100%-1rem)] scrollbar-hide">
          {selectedMenuItem === 'Profile' && (
            <CharacterCard elementColor={elementColor}>
              <ProfileContent
                character={character}
                onNavigate={setSelectedMenuItem}
              />
            </CharacterCard>
          )}
          {selectedMenuItem === 'Talents' && (
            <CharacterCard elementColor={elementColor}>
              <CharacterTalentTable talents={character.talents} />
            </CharacterCard>
          )}
          {selectedMenuItem === 'Constellations' && (
            <CharacterCard elementColor={elementColor}>
              <CharacterConstellations
                constellations={character.constellations}
                element={character.element}
              />
            </CharacterCard>
          )}
          {selectedMenuItem === 'Passives' && (
            <CharacterCard elementColor={elementColor}>
              <CharacterPassives
                passives={character.talents.filter((talent) => {
                  return ![
                    'Normal Attack',
                    'Elemental Skill',
                    'Elemental Burst',
                  ].includes(talent.talentType);
                })}
              />
            </CharacterCard>
          )}
          {selectedMenuItem === 'Attacks' && (
            <CharacterCard elementColor={elementColor}>
              <CharacterAttackAnimations character={character} />
            </CharacterCard>
          )}
          {selectedMenuItem === 'Routine' && (
            <CharacterCard elementColor={elementColor}>
              <CharacterRoutineDetailed character={character} />
            </CharacterCard>
          )}
        </div>
      </div>
    </div>
  );
};

/* Enhanced Stat Item Component with optional icon */
interface StatItemProps {
  label: string;
  value: string;
  iconUrl?: string;
  highlight?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  iconUrl,
  highlight,
}) => (
  <div className="group p-3 rounded-lg bg-midnight-800/40 border border-midnight-600/30 hover:border-starlight-500/30 transition-all duration-300">
    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
      {label}
    </h3>
    <div className="flex items-center gap-2">
      {iconUrl && (
        <CachedImage
          src={iconUrl}
          alt={value}
          className="w-6 h-6 object-contain"
        />
      )}
      <p
        className={`text-lg font-semibold ${highlight ? 'text-celestial-400' : 'text-foreground'}`}
      >
        {value}
      </p>
    </div>
  </div>
);

/* Section Header for Profile */
interface SectionHeaderProps {
  title: string;
  elementColor?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
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

/* Elemental Burst Showcase Component */
interface ElementalBurstShowcaseProps {
  character: CharacterDetailed;
  elementColor: string;
  onNavigate: (menuItem: CharacterMenuItem) => void;
}

const ElementalBurstShowcase: React.FC<ElementalBurstShowcaseProps> = ({
  character,
  elementColor,
  onNavigate,
}) => {
  // Find the Elemental Burst talent
  const burstTalent = character.talents.find(
    (t) => t.talentType === 'Elemental Burst'
  );

  if (!burstTalent) return null;

  // Get energy cost and cooldown from scaling data
  const energyCost = burstTalent.scaling.find((s) =>
    s.key.toLowerCase().includes('energy')
  )?.value[0];
  const cooldown = burstTalent.scaling.find((s) => s.key.toLowerCase() === 'cd')
    ?.value[0];

  // Get preview animation from figureUrls
  const previewAnimation: AnimationMedia | undefined = burstTalent.figureUrls[0]
    ? {
        imageUrl: burstTalent.figureUrls[0].url,
        videoUrl: '', // GIF works as image
        caption: burstTalent.figureUrls[0].caption,
        videoType: '',
      }
    : undefined;

  // Format description - take first meaningful paragraph
  const formatDescription = (desc: string) => {
    // Remove prefix like "Description\nGameplay Notes\n..." and clean up
    const cleaned = desc
      .replace(/^Description\n.*?\n/i, '')
      .replace(/^Gameplay Notes\n.*?\n/i, '')
      .replace(/^Advanced Properties\n.*?\n/i, '')
      .replace(/^Attribute Scaling\n.*?\n/i, '')
      .replace(/^Preview\n/i, '')
      .trim();

    // Take first 2-3 sentences
    const sentences = cleaned
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    return sentences.slice(0, 3).join('. ') + (sentences.length > 0 ? '.' : '');
  };

  return (
    <section>
      <SectionHeader title="Elemental Burst" elementColor={elementColor} />
      <div
        className="rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg"
        style={{
          borderColor: `${elementColor}40`,
          boxShadow: `0 4px 20px ${elementColor}15`,
        }}
      >
        {/* Header with icon and name */}
        <div
          className="flex items-center gap-4 p-4"
          style={{
            background: `linear-gradient(135deg, ${elementColor}20 0%, transparent 50%)`,
          }}
        >
          <div
            className="w-14 h-14 rounded-xl p-2 shrink-0"
            style={{
              background: `linear-gradient(135deg, ${elementColor}30, ${elementColor}10)`,
              boxShadow: `0 0 20px ${elementColor}20`,
            }}
          >
            <CachedImage
              src={burstTalent.talentIcon}
              alt={burstTalent.talentName}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
              {burstTalent.talentType}
            </p>
            <h4 className="text-lg font-bold text-foreground truncate">
              {burstTalent.talentName}
            </h4>
          </div>
          {/* Stats badges */}
          <div className="flex items-center gap-2">
            {energyCost && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{
                  background: `${elementColor}25`,
                  color: elementColor,
                }}
              >
                <Zap className="w-4 h-4" />
                {energyCost}
              </div>
            )}
            {cooldown && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-midnight-700/60 text-starlight-300">
                <Clock className="w-4 h-4" />
                {cooldown}
              </div>
            )}
          </div>
        </div>

        {/* Content area with video and description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Preview Animation */}
          {previewAnimation && (
            <div className="relative aspect-video bg-midnight-900/50">
              <AnimatedCover
                animation={previewAnimation}
                fallbackUrl={previewAnimation.imageUrl}
                aspectRatio="16/9"
                showLoadingIndicator={false}
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-midnight-900/80 pointer-events-none md:block hidden" />
            </div>
          )}

          {/* Description */}
          <div className="p-5 flex flex-col justify-center bg-midnight-800/30">
            <p className="text-sm text-starlight-300 leading-relaxed">
              {formatDescription(burstTalent.description)}
            </p>
            <button
              onClick={() => onNavigate('Talents')}
              className="mt-4 text-xs font-medium uppercase tracking-wider transition-colors self-start px-4 py-2 rounded-lg border hover:bg-midnight-700/50"
              style={{
                color: elementColor,
                borderColor: `${elementColor}40`,
              }}
            >
              View Full Details →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

/* Profile Content Component */
interface ProfileContentProps {
  character: CharacterDetailed;
  onNavigate: (menuItem: CharacterMenuItem) => void;
}

const ProfileContent: React.FC<ProfileContentProps> = ({
  character,
  onNavigate,
}) => {
  const primitives = usePrimitives();

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

  const elementColor = decideColor(character.element);

  return (
    <div className="space-y-8">
      {/* Character Info Section */}
      <section>
        <SectionHeader title="Character Info" elementColor={elementColor} />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatItem
            label="Rarity"
            value={getRarityStars(character.rarity)}
            highlight
          />
          <StatItem
            label="Element"
            value={character.element}
            iconUrl={elementIcon || character.elementUrl}
          />
          <StatItem
            label="Weapon"
            value={character.weaponType}
            iconUrl={weaponIcon || character.weaponUrl}
          />
          <StatItem
            label="Region"
            value={character.region}
            iconUrl={regionIcon || character.regionUrl}
          />
          <StatItem label="Model Type" value={character.modelType} />
          {character.version && (
            <StatItem label="Version" value={`v${character.version}`} />
          )}
        </div>
      </section>

      {/* Elemental Burst Showcase */}
      <ElementalBurstShowcase
        character={character}
        elementColor={elementColor}
        onNavigate={onNavigate}
      />
    </div>
  );
};

interface CharacterCardProps {
  children: React.ReactNode;
  elementColor?: string;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  children,
  elementColor,
}) => {
  return (
    <Card
      className="p-5 h-full w-full overflow-auto scrollbar-hide bg-midnight-800/30 backdrop-blur-sm border-midnight-600/40 rounded-xl"
      style={{
        boxShadow: elementColor ? `inset 0 1px 0 ${elementColor}10` : undefined,
      }}
    >
      {children}
    </Card>
  );
};

export default CharacterDescription;
