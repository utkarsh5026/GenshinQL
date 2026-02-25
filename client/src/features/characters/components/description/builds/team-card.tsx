import React, { useState } from 'react';

import { Heading, Text } from '@/components/ui/text';
import { CachedImage } from '@/features/cache';
import { useCharacters } from '@/features/characters/stores';
import { TeamComp } from '@/types';

interface TeamCardProps {
  team: TeamComp;
  elementColor: string;
  index?: number;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  elementColor,
  index = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const characters = useCharacters();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const staggerDelay = isMounted ? Math.min(index * 0.05, 0.8) : 0;

  const getCharacterIcon = (name: string) => {
    const character = characters.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    return character?.iconUrl;
  };

  return (
    <div
      className={`group relative p-4 rounded-xl border transition-all duration-300 ${
        isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      } hover:-translate-y-1`}
      style={{
        borderColor: `${elementColor}30`,
        boxShadow: isHovered
          ? `0 8px 24px ${elementColor}25`
          : `0 4px 12px ${elementColor}15`,
        background: `linear-gradient(135deg, ${elementColor}05 0%, transparent 100%)`,
        transitionDelay: `${staggerDelay}s`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Team Name */}
      <Heading
        level={4}
        size="sm"
        weight="semibold"
        className="mb-4"
        style={{ color: elementColor }}
      >
        {team.name}
      </Heading>

      {/* Character Icons */}
      <div className="flex items-center gap-2 mb-4">
        {team.characters.map((charName) => {
          const iconUrl = getCharacterIcon(charName);
          return (
            <div
              key={charName}
              className="flex flex-col items-center gap-1.5 group/char"
            >
              <div className="relative">
                {iconUrl ? (
                  <CachedImage
                    src={iconUrl}
                    alt={charName}
                    lazy={true}
                    rootMargin="200px"
                    showSkeleton={true}
                    skeletonShape="circle"
                    skeletonSize="md"
                    className="w-12 h-12 rounded-full object-cover border-2 transition-all duration-300 group-hover/char:scale-110"
                    style={{ borderColor: `${elementColor}40` }}
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold border-2"
                    style={{
                      borderColor: `${elementColor}40`,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {charName.substring(0, 2)}
                  </div>
                )}
              </div>
              <Text
                as="span"
                color="muted"
                align="center"
                truncate
                className="text-[9px] max-w-12"
              >
                {charName}
              </Text>
            </div>
          );
        })}
      </div>

      {/* Roles */}
      <div className="mb-4">
        <Heading
          level={5}
          size="xs"
          weight="semibold"
          uppercase
          color="muted"
          className="tracking-wider mb-2"
        >
          Roles
        </Heading>
        <ul className="space-y-1.5">
          {Object.entries(team.roles).map(([character, role]) => (
            <li key={character} className="flex items-start gap-2 text-xs">
              <span
                className="w-1 h-1 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: elementColor }}
              />
              <Text as="span" className="text-starlight-200">
                <Text as="span" weight="medium">
                  {character}:
                </Text>{' '}
                {role}
              </Text>
            </li>
          ))}
        </ul>
      </div>

      {/* Rotation */}
      <div>
        <Heading
          level={5}
          size="xs"
          weight="semibold"
          uppercase
          color="muted"
          className="tracking-wider mb-2"
        >
          Rotation
        </Heading>
        <div
          className="p-2.5 rounded-lg overflow-x-auto scrollbar-thin"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderLeft: `2px solid ${elementColor}40`,
          }}
        >
          <code className="text-xs text-starlight-300 whitespace-pre-wrap wrap-break-word font-mono">
            {team.rotation}
          </code>
        </div>
      </div>

      {/* Optional Notes */}
      {team.notes && (
        <div
          className="mt-3 pt-3 border-t"
          style={{ borderColor: `${elementColor}15` }}
        >
          <Text as="p" size="xs" color="muted" className="italic">
            {team.notes}
          </Text>
        </div>
      )}
    </div>
  );
};
