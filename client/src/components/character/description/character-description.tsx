import React, { useState } from 'react';

import { Card } from '@/components/ui/card.tsx';
import { CharacterDetailed } from '@/types';
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
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatItem
                    label="Rarity"
                    value={`${character.rarity}★`}
                    highlight
                  />
                  <StatItem label="Element" value={character.element} />
                  <StatItem label="Weapon" value={character.weaponType} />
                  <StatItem label="Region" value={character.region} />
                  <StatItem label="Model Type" value={character.modelType} />
                  {character.version && (
                    <StatItem label="Version" value={character.version} />
                  )}
                </div>
              </div>
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

/* Stat Item Component for Profile */
interface StatItemProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, highlight }) => (
  <div className="group p-3 rounded-lg bg-midnight-800/40 border border-midnight-600/30 hover:border-starlight-500/30 transition-all duration-300">
    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
      {label}
    </h3>
    <p
      className={`text-lg font-semibold ${highlight ? 'text-celestial-400' : 'text-foreground'}`}
    >
      {value}
    </p>
  </div>
);

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
