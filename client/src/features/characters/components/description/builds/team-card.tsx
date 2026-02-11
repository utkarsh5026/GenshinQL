import React, { useState } from 'react';

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
      <h4
        className="text-sm font-semibold mb-4"
        style={{ color: elementColor }}
      >
        {team.name}
      </h4>

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
              <span className="text-[9px] text-muted-foreground text-center max-w-12 truncate">
                {charName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Roles */}
      <div className="mb-4">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Roles
        </h5>
        <ul className="space-y-1.5">
          {Object.entries(team.roles).map(([character, role]) => (
            <li key={character} className="flex items-start gap-2 text-xs">
              <span
                className="w-1 h-1 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: elementColor }}
              />
              <span className="text-starlight-200">
                <span className="font-medium">{character}:</span> {role}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Rotation */}
      <div>
        <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Rotation
        </h5>
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
          <p className="text-xs text-muted-foreground italic">{team.notes}</p>
        </div>
      )}
    </div>
  );
};
