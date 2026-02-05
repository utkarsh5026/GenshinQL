import React from 'react';

import { ListSplitter } from '@/components/utils';
import { Constellation } from '@/types';

interface CharacterConstellationsProps {
  constellations: Constellation[];
}

const CharacterConstellations: React.FC<CharacterConstellationsProps> = ({
  constellations,
}) => {
  const getConstellationStyles = (level: number) => {
    // Progressive color intensity based on constellation level
    const talentUpgradeStyle = {
      // C3 & C5 - Talent Level Increase (green/success)
      accentColor: 'bg-success-500',
      borderColor: 'border-l-success-500',
      textColor: 'text-success-400',
      bgGlow: 'bg-success-500/5',
      levelGradient: 'from-success-600 to-success-800',
      isTalentUpgrade: true,
    };

    const styles = [
      {
        // C1 - Starlight (softer blue)
        accentColor: 'bg-starlight-500',
        borderColor: 'border-l-starlight-500',
        textColor: 'text-starlight-400',
        bgGlow: 'bg-starlight-500/5',
        levelGradient: 'from-starlight-600 to-starlight-800',
        isTalentUpgrade: false,
      },
      {
        // C2 - Info (blue)
        accentColor: 'bg-info-500',
        borderColor: 'border-l-info-500',
        textColor: 'text-info-400',
        bgGlow: 'bg-info-500/5',
        levelGradient: 'from-info-600 to-info-800',
        isTalentUpgrade: false,
      },
      talentUpgradeStyle, // C3
      {
        // C4 - Celestial (amber)
        accentColor: 'bg-celestial-500',
        borderColor: 'border-l-celestial-500',
        textColor: 'text-celestial-400',
        bgGlow: 'bg-celestial-500/5',
        levelGradient: 'from-celestial-600 to-celestial-800',
        isTalentUpgrade: false,
      },
      talentUpgradeStyle, // C5
      {
        // C6 - Warning (vibrant gold/orange)
        accentColor: 'bg-warning-500',
        borderColor: 'border-l-warning-500',
        textColor: 'text-warning-400',
        bgGlow: 'bg-warning-500/5',
        levelGradient: 'from-warning-600 to-warning-800',
        isTalentUpgrade: false,
      },
    ];

    return styles[level - 1] || styles[0];
  };

  return (
    <div className="flex flex-col gap-2">
      {constellations.map((constellation) => {
        const styles = getConstellationStyles(constellation.level);

        return (
          <div
            key={constellation.name}
            className="group flex gap-3 p-3 rounded border border-border/40 bg-card/30 hover:bg-card/50 hover:border-border/60 transition-all"
          >
            {/* Icon */}
            <div className="relative flex-shrink-0">
              <img
                className="w-10 h-10 object-contain opacity-90"
                src={constellation.iconUrl}
                alt={constellation.name}
              />
              {/* Talent upgrade indicator */}
              {styles.isTalentUpgrade && (
                <div className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-success-600 text-white text-[9px] font-bold">
                  +3
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Title with inline level */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`
                    flex-shrink-0 flex items-center justify-center
                    w-7 h-7 rounded-full bg-gradient-to-br ${styles.levelGradient}
                    text-white text-xs font-bold
                  `}
                >
                  {constellation.level}
                </span>
                <h3 className="text-sm font-semibold text-foreground/90">
                  {constellation.name}
                </h3>
                {styles.isTalentUpgrade && (
                  <span className="text-xs text-success-400 font-medium">
                    • Talent Lv. +3
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="text-xs leading-relaxed text-muted-foreground/80">
                <ListSplitter text={constellation.description} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CharacterConstellations;
