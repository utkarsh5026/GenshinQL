import React from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import { CachedImage } from '@/components/utils/CachedImage';
import { Talent } from '@/types';

import ListSplitter from '../../utils/list-splitter.tsx';

interface CharacterPassivesProps {
  passives: Talent[];
}

/**
 * CharacterPassives component displays a list of passive talents for a character.
 *
 * @param {CharacterPassivesProps} props - The props for the component.
 * @param {Talent[]} props.passives - An array of passive talents to be displayed.
 * @returns {JSX.Element} A React component that renders the passive talents in a card format.
 */
const CharacterPassives: React.FC<CharacterPassivesProps> = ({ passives }) => {
  const sortPassives = (a: Talent, b: Talent): number => {
    const order = {
      '1st Ascension Passive': 1,
      '4th Ascension Passive': 2,
      'Utility Passive': 3,
    };

    return (
      (order[a.talentType as keyof typeof order] || 999) -
      (order[b.talentType as keyof typeof order] || 999)
    );
  };

  const getPassiveStyles = (talentType: string) => {
    switch (talentType) {
      case '1st Ascension Passive':
        return {
          borderClass: 'border-celestial-500/30 hover:border-celestial-400/50',
          bgClass: 'bg-gradient-to-br from-celestial-950/20 to-transparent',
          iconBgClass: 'bg-celestial-900/40',
          tagClass:
            'bg-celestial-900/50 text-celestial-200 border-celestial-700/50',
          glowClass: 'shadow-celestial-500/10',
        };
      case '4th Ascension Passive':
        return {
          borderClass: 'border-legendary-500/30 hover:border-legendary-400/50',
          bgClass: 'bg-gradient-to-br from-legendary-950/20 to-transparent',
          iconBgClass: 'bg-legendary-900/40',
          tagClass:
            'bg-legendary-900/50 text-legendary-200 border-legendary-700/50',
          glowClass: 'shadow-legendary-500/10',
        };
      case 'Utility Passive':
        return {
          borderClass: 'border-starlight-500/30 hover:border-starlight-400/50',
          bgClass: 'bg-gradient-to-br from-starlight-950/20 to-transparent',
          iconBgClass: 'bg-starlight-900/40',
          tagClass:
            'bg-starlight-900/50 text-starlight-200 border-starlight-700/50',
          glowClass: 'shadow-starlight-500/10',
        };
      default:
        return {
          borderClass: 'border-midnight-500/30 hover:border-midnight-400/50',
          bgClass: 'bg-gradient-to-br from-midnight-950/20 to-transparent',
          iconBgClass: 'bg-midnight-900/40',
          tagClass:
            'bg-midnight-900/50 text-midnight-200 border-midnight-700/50',
          glowClass: 'shadow-midnight-500/10',
        };
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {passives.sort(sortPassives).map((passive) => {
        const styles = getPassiveStyles(passive.talentType);
        return (
          <Card
            key={passive.talentName}
            className={`
              group relative overflow-hidden border-2 transition-all duration-300
              ${styles.borderClass} ${styles.bgClass} ${styles.glowClass}
              hover:shadow-lg hover:scale-[1.01] hover:translate-y-[-2px]
            `}
          >
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-white/5 to-transparent pointer-events-none" />

            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                {/* Icon with styled background */}
                <div
                  className={`
                  relative shrink-0 rounded-lg p-2 ${styles.iconBgClass}
                  ring-1 ring-white/10 group-hover:ring-white/20 transition-all
                  group-hover:scale-110 duration-300
                `}
                >
                  <CachedImage
                    lazy
                    className="h-10 w-10 drop-shadow-lg"
                    src={passive.talentIcon}
                    alt={passive.talentName}
                    skeletonSize="md"
                    skeletonShape="rounded"
                  />
                  {/* Icon glow effect */}
                  <div className="absolute inset-0 rounded-lg bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Title and tag */}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold text-foreground/95 mb-2 leading-tight">
                    {passive.talentName}
                  </CardTitle>
                  <span
                    className={`
                    inline-block px-3 py-1 rounded-full text-xs font-medium border
                    ${styles.tagClass} transition-all duration-300
                    group-hover:scale-105
                  `}
                  >
                    {passive.talentType}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Subtle divider */}
              <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent mb-4" />

              {/* Description with better typography */}
              <div className="text-sm leading-relaxed text-foreground/80">
                <ListSplitter text={passive.description} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CharacterPassives;
