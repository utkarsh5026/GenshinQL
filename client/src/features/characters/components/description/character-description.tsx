import React, { useEffect, useMemo, useState } from 'react';

import { Card } from '@/components/ui/card';
import { ScrollTabItem, ScrollTabs } from '@/components/ui/scroll-tabs';
import { ELEMENT_COLORS, getElementHexColor } from '@/lib/game-colors';

import { useCharacterAbilitiesStore } from '../../stores';
import { CharacterDetailed, CharacterMenuItem } from '../../types';
import { BuildsDetailed } from './builds/builds-detailed';
import ElementalBurstShowcase from './character-burst-showcase';
import styles from './character-description.module.css';
import { CharacterStatsCompact } from './character-info';
import { CharacterConstellations, CharacterPassives } from './constellations';
import { MobileProfileHeader, ProfileHeader } from './profile-header';
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

/** Maps each tab to its unique CSS animation class from the CSS module */
const TAB_ANIMATION_MAP: Record<CharacterMenuItem, string> = {
  Profile: styles.stickerProfile,
  Talents: styles.stickerTalents,
  Constellations: styles.stickerConstellations,
  Passives: styles.stickerPassives,
  Routine: styles.stickerRoutine,
  Builds: styles.stickerBuilds,
};

/** Returns element-specific Tailwind classes for menu item active states. */
function getElementClasses(element: string) {
  const entry =
    ELEMENT_COLORS[element.toLowerCase() as keyof typeof ELEMENT_COLORS];
  if (!entry) {
    return {
      active:
        'bg-linear-to-r from-celestial-500/20 via-celestial-400/15 to-transparent text-celestial-300 border-celestial-500/40',
      indicator: 'bg-celestial-400',
    };
  }
  return {
    active: `bg-linear-to-r ${entry.gradientFrom} ${entry.text} ${entry.border}`,
    indicator: entry.indicator,
  };
}

const CharacterDescription: React.FC<CharacterDetailedProps> = ({
  character,
}) => {
  const [selectedMenuItem, setSelectedMenuItem] =
    useState<CharacterMenuItem>('Profile');

  const scrollTabItems = useMemo<ScrollTabItem<CharacterMenuItem>[]>(
    () =>
      menuItems.map((item, i) => ({
        id: item,
        label: item,
        imageUrl: character?.stickers?.length
          ? character.stickers[i % character.stickers.length]
          : undefined,
        animationClass: TAB_ANIMATION_MAP[item],
      })),
    [character]
  );

  useEffect(() => {
    if (!character) return;

    const { setCharacterAbilities } = useCharacterAbilitiesStore.getState();
    setCharacterAbilities(character.name, character.talents, character.element);
  }, [character]);

  if (!character)
    return (
      <div className="flex items-center justify-center min-h-[50vh] lg:h-[90vh] text-muted-foreground bg-card/50 rounded-lg border border-border">
        Character not found
      </div>
    );

  const elementColor = getElementHexColor(character.element);
  const elementClasses = getElementClasses(character.element);

  return (
    <div className="relative flex flex-col lg:h-[90vh] lg:overflow-auto rounded-xl scrollbar-hide bg-linear-to-br from-midnight-900/90 via-midnight-800/80 to-midnight-900/90 backdrop-blur-sm">
      <div className="relative z-10 flex flex-col lg:flex-row gap-2 md:gap-4 lg:gap-6 p-0 md:p-4 lg:p-5 lg:h-full">
        {/* Mobile: Profile Header, Desktop: Sidebar */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-0 lg:gap-4">
          {/* Desktop: Profile Header */}
          <div className="hidden lg:block">
            <ProfileHeader
              name={character.name}
              avatarUrl={character.iconUrl}
              idleOne={character.screenAnimation?.idleOne}
              idleTwo={character.screenAnimation?.idleTwo}
              fallbackCoverUrl={character.imageUrls.nameCard}
              roles={character.roles}
            />
          </div>

          <MobileProfileHeader
            character={character}
            elementColor={elementColor}
          />

          {/* Desktop: Vertical sidebar nav */}
          <nav className="hidden lg:flex lg:flex-col gap-1.5 mt-2">
            {menuItems.map((item, i) => {
              const isActive = selectedMenuItem === item;
              const stickerUrl = character.stickers?.length
                ? character.stickers[i % character.stickers.length]
                : undefined;
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
                      ? { boxShadow: `0 0 12px ${elementColor}20` }
                      : undefined
                  }
                >
                  {isActive && (
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-full ${elementClasses.indicator}`}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {stickerUrl && (
                      <img
                        src={stickerUrl}
                        alt=""
                        aria-hidden
                        className={`${styles.sticker} ${isActive ? `${TAB_ANIMATION_MAP[item]} ${styles.stickerActive}` : ''}`}
                      />
                    )}
                    {item}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile: Sticky ScrollTabs — placed outside sidebar so sticky spans full content height */}
        <div className="lg:hidden sticky top-0 z-20 bg-midnight-900/95 backdrop-blur-sm">
          <ScrollTabs
            items={scrollTabItems}
            activeId={selectedMenuItem}
            onChange={setSelectedMenuItem}
            activeColor={elementColor}
            indicatorId="character-mobile-tabs"
          />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 min-w-0 lg:overflow-auto lg:h-[calc(100%-1rem)] scrollbar-hide">
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
  const elementColor = getElementHexColor(character.element);

  return (
    <div className="space-y-4 md:space-y-8">
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
      className="px-2 py-3 md:p-5 lg:h-full w-full lg:overflow-auto scrollbar-hide bg-transparent border-transparent shadow-none md:bg-midnight-800/30 md:backdrop-blur-sm md:border-midnight-600/40 md:rounded-xl md:shadow-sm"
      style={{
        boxShadow: elementColor ? `inset 0 1px 0 ${elementColor}10` : undefined,
      }}
    >
      {children}
    </Card>
  );
};

export default CharacterDescription;
