import React, { useEffect, useState } from 'react';

import { Card } from '@/components/ui/card';
import { decideColor } from '@/utils/color';

import { useCharacterAbilitiesStore } from '../../stores';
import { CharacterDetailed, CharacterMenuItem } from '../../types';
import { BuildsDetailed } from './builds/builds-detailed';
import ElementalBurstShowcase from './character-burst-showcase';
import { CharacterStatsCompact } from './character-info';
import { CharacterConstellations } from './constellations';
import { CharacterPassives } from './passives';
import ProfileHeader from './profile-header';
import { CharacterRoutine } from './routine/character-routine';
import TalentShowcase from './talents/talent-showcase';

interface CharacterDetailedProps {
  character: CharacterDetailed | null;
}

const menuItems: CharacterMenuItem[] = [
  'Profile',
  'Talents',
  'Constellations',
  'Passives',
  'Routine',
  'Builds',
] as const;

/**
 * Returns element-specific Tailwind classes for menu items based on character element
 */
function getElementClasses(element: string) {
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
}

/* getRarityStars moved to character-stats-compact.tsx */

const CharacterDescription: React.FC<CharacterDetailedProps> = ({
  character,
}) => {
  const [selectedMenuItem, setSelectedMenuItem] =
    useState<CharacterMenuItem>('Profile');

  useEffect(() => {
    if (!character) return;

    const { setCharacterAbilities } = useCharacterAbilitiesStore.getState();
    setCharacterAbilities(character.name, character.talents, character.element);
  }, [character]);

  if (!character)
    return (
      <div className="flex items-center justify-center h-[90vh] text-muted-foreground bg-card/50 rounded-lg border border-border">
        Character not found
      </div>
    );

  const elementColor = decideColor(character.element);
  const elementClasses = getElementClasses(character.element);

  return (
    <div className="relative flex flex-col h-[90vh] overflow-auto rounded-xl scrollbar-hide bg-linear-to-br from-midnight-900/90 via-midnight-800/80 to-midnight-900/90 backdrop-blur-sm">
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

      <div className="relative z-10 flex flex-col lg:flex-row gap-2 md:gap-4 lg:gap-6 p-2 md:p-4 lg:p-5 h-full">
        {/* Mobile: Horizontal Menu at Top, Desktop: Sidebar */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2 md:gap-4">
          {/* Profile Header - Hidden on small screens, shown on desktop */}
          <div className="hidden lg:block">
            <ProfileHeader
              name={character.name}
              avatarUrl={character.iconUrl}
              idleOne={character.screenAnimation?.idleOne}
              idleTwo={character.screenAnimation?.idleTwo}
              fallbackCoverUrl={character.imageUrls.nameCard}
            />
          </div>

          {/* Menu Navigation - Horizontal on mobile, Vertical on desktop */}
          <nav className="flex lg:flex-col gap-1 sm:gap-1.5 overflow-x-auto lg:overflow-x-visible scrollbar-hide snap-x snap-mandatory lg:snap-none mt-0 lg:mt-2 pb-1 sm:pb-2 lg:pb-0 -mx-2 px-2 md:mx-0 md:px-0 max-w-[calc(100vw-5rem)] lg:max-w-none">
            {menuItems.map((item) => {
              const isActive = selectedMenuItem === item;
              return (
                <button
                  onClick={() => setSelectedMenuItem(item)}
                  key={item}
                  className={`
                    relative whitespace-nowrap shrink-0 lg:w-full text-left text-[10px] sm:text-xs md:text-sm font-medium rounded-md lg:rounded-lg px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 snap-start lg:snap-align-none
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
                  {/* Active indicator bar - Bottom on mobile, Left on desktop */}
                  {isActive && (
                    <span
                      className={`absolute lg:left-0 left-1/2 lg:top-1/2 top-auto bottom-0 lg:-translate-y-1/2 -translate-x-1/2 lg:translate-x-0 lg:w-1 lg:h-4 w-6 sm:w-8 h-0.5 sm:h-1 rounded-t-full lg:rounded-r-full lg:rounded-t-none ${elementClasses.indicator}`}
                    />
                  )}
                  {item}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 min-w-0 overflow-auto h-full lg:h-[calc(100%-1rem)] scrollbar-hide">
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
              <TalentShowcase character={character} />
            </CharacterCard>
          )}
          {selectedMenuItem === 'Constellations' && (
            <CharacterCard elementColor={elementColor}>
              <CharacterConstellations
                constellations={character.constellations}
                element={character.element}
                characterName={character.name}
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
                characterName={character.name}
              />
            </CharacterCard>
          )}
          {selectedMenuItem === 'Routine' && (
            <CharacterCard elementColor={elementColor}>
              <CharacterRoutine character={character} />
            </CharacterCard>
          )}
          {selectedMenuItem === 'Builds' && (
            <CharacterCard elementColor={elementColor}>
              <BuildsDetailed
                character={character}
                elementColor={elementColor}
              />
            </CharacterCard>
          )}
        </div>
      </div>
    </div>
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
  const elementColor = decideColor(character.element);

  return (
    <div className="space-y-8">
      {/* Character Stats, Farming, and Build Section */}
      <section>
        <CharacterStatsCompact
          character={character}
          elementColor={elementColor}
          onNavigate={onNavigate}
        />
      </section>

      {/* Elemental Burst Showcase */}
      <section>
        <ElementalBurstShowcase
          character={character}
          elementColor={elementColor}
          onNavigate={onNavigate}
        />
      </section>
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
      className="p-3 sm:p-4 md:p-5 h-full w-full overflow-auto scrollbar-hide bg-midnight-800/30 backdrop-blur-sm border-midnight-600/40 rounded-xl"
      style={{
        boxShadow: elementColor ? `inset 0 1px 0 ${elementColor}10` : undefined,
      }}
    >
      {children}
    </Card>
  );
};

export default CharacterDescription;
