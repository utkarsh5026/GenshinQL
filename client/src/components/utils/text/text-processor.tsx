import {
  Battery,
  FlaskConical,
  Heart,
  Shield,
  Sparkles,
  Sword,
  Target,
} from 'lucide-react';
import React, { useMemo } from 'react';

import { AbilityReference } from '@/components/utils/text/ability-reference';
import { useCharacterAbilityData } from '@/features/characters/stores';
import type { AbilityReference as AbilityReferenceType } from '@/lib/abilityMatcher';
import { segmentText } from '@/lib/abilityMatcher';
import type { Element } from '@/types';

const ELEMENT_COLORS: Record<Element, string> = {
  dendro: 'var(--color-dendro-500)',
  pyro: 'var(--color-pyro-500)',
  hydro: 'var(--color-hydro-500)',
  electro: 'var(--color-electro-500)',
  anemo: 'var(--color-anemo-500)',
  geo: 'var(--color-geo-500)',
  cryo: 'var(--color-cryo-500)',
} as const;

const STAT_COLORS: Record<string, string> = {
  'CRIT Rate': '#f87171', // red-400
  'CRIT DMG': '#fb923c', // orange-400
  ATK: '#fbbf24', // amber-400
  HP: '#4ade80', // green-400
  DEF: '#facc15', // yellow-400
  'Energy Recharge': '#c084fc', // purple-400
  'Elemental Mastery': '#2dd4bf', // teal-400
};

const STAT_ICONS: Record<string, React.ElementType> = {
  'CRIT Rate': Target,
  'CRIT DMG': Sparkles,
  ATK: Sword,
  HP: Heart,
  DEF: Shield,
  'Energy Recharge': Battery,
  'Elemental Mastery': FlaskConical,
};

interface StatTextProps {
  stat: string;
  Icon: React.ElementType;
  color: string;
}

const StatText: React.FC<StatTextProps> = ({ stat, Icon, color }) => (
  <span
    className="inline-flex items-center gap-1 font-semibold"
    style={{ color }}
  >
    {stat}
    <Icon className="inline-block h-[0.8em] w-[0.8em]" aria-hidden="true" />
  </span>
);

const TEXT_PATTERN =
  /(Elemental Mastery|Energy Recharge|CRIT Rate|CRIT DMG|ATK|DEF|HP)|\b(dendro|pyro|hydro|electro|anemo|geo|cryo)\b|(\d+%?)/gi;

interface TextProcessorProps {
  text: string;
  className?: string;
}

/**
 * TextProcessor component processes a given text string and applies
 * specific styles to element keywords and numbers/percentages.
 */
export const TextProcessor: React.FC<TextProcessorProps> = ({
  text,
  className = '',
}) => {
  const processedContent = useMemo(() => {
    const parts = text.split(TEXT_PATTERN).filter(Boolean);

    return parts.map((part, index) => {
      // Check for stat match first (exact case)
      const statColor = STAT_COLORS[part];
      const StatIcon = STAT_ICONS[part];
      if (statColor && StatIcon) {
        return (
          <StatText
            key={`${index}-stat-${part}`}
            stat={part}
            Icon={StatIcon}
            color={statColor}
          />
        );
      }

      // Then check for element match (case-insensitive)
      const lowercasePart = part.toLowerCase() as Element;
      const elementColor = ELEMENT_COLORS[lowercasePart];

      // Then check for numbers
      if (/^\d+%?$/.test(part)) {
        return (
          <span key={`${index}-num-${part}`} className="text-warning-500">
            {part}
          </span>
        );
      }

      // Render element with color
      return elementColor ? (
        <span
          key={`${index}-elem-${lowercasePart}`}
          className="font-semibold sm:font-bold"
          style={{ color: elementColor }}
        >
          {part}
        </span>
      ) : (
        <React.Fragment key={`${index}-text`}>{part}</React.Fragment>
      );
    });
  }, [text]);

  return <div className={className}>{processedContent}</div>;
};

interface TextProcessorWithAbilitiesProps {
  text: string;
  characterName?: string;
  abilityMap?: Map<string, AbilityReferenceType>;
  elementColor?: string;
  className?: string;
}

/**
 * Enhanced text processor that handles both ability references and element/number highlighting
 * First pass: Segments text into ability references and plain text
 * Second pass: Applies element/number highlighting to plain text segments
 */
export const TextProcessorWithAbilities: React.FC<
  TextProcessorWithAbilitiesProps
> = ({
  text,
  characterName,
  abilityMap: propAbilityMap,
  elementColor: propElementColor,
  className = '',
}) => {
  const storeData = useCharacterAbilityData(characterName || '');

  const abilityMap = propAbilityMap ?? storeData.abilityMap;
  const elementColor = propElementColor ?? storeData.elementColor;

  const processedContent = useMemo(() => {
    if (!abilityMap || abilityMap.size === 0) {
      return processTextSegment(text);
    }

    const segments = segmentText(text, abilityMap);

    return segments.map((segment, segmentIndex) => {
      if (segment.type === 'ability') {
        return (
          <AbilityReference
            key={`ability-${segmentIndex}`}
            abilityName={segment.content}
            reference={segment.reference}
            elementColor={elementColor}
          />
        );
      } else {
        return (
          <React.Fragment key={`text-${segmentIndex}`}>
            {processTextSegment(segment.content)}
          </React.Fragment>
        );
      }
    });
  }, [text, abilityMap, elementColor]);

  return <div className={className}>{processedContent}</div>;
};

/**
 * Processes a text segment for stat terms, element keywords, and numbers
 */
function processTextSegment(text: string): React.ReactNode[] {
  const parts = text.split(TEXT_PATTERN).filter(Boolean);

  return parts.map((part, index) => {
    // Check for stat match first (exact case)
    const statColor = STAT_COLORS[part];
    const StatIcon = STAT_ICONS[part];
    if (statColor && StatIcon) {
      return (
        <StatText
          key={`${index}-stat-${part}`}
          stat={part}
          Icon={StatIcon}
          color={statColor}
        />
      );
    }

    // Then check for element match (case-insensitive)
    const lowercasePart = part.toLowerCase() as Element;
    const elementColor = ELEMENT_COLORS[lowercasePart];

    // Then check for numbers
    if (/^\d+%?$/.test(part)) {
      return (
        <span key={`${index}-num-${part}`} className="text-warning-500">
          {part}
        </span>
      );
    }

    // Render element with color
    return elementColor ? (
      <span
        key={`${index}-elem-${lowercasePart}`}
        className="font-semibold sm:font-bold"
        style={{ color: elementColor }}
      >
        {part}
      </span>
    ) : (
      <React.Fragment key={`${index}-text`}>{part}</React.Fragment>
    );
  });
}
