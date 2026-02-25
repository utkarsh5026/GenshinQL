import {
  Battery,
  Crosshair,
  Flame,
  FlaskConical,
  Heart,
  Shield,
  Sword,
} from 'lucide-react';
import React, { useMemo } from 'react';

import { Text } from '@/components/ui/text';
import { AbilityReference } from '@/components/utils/text/ability-reference';
import { CachedImage } from '@/features/cache';
import { useCharacterAbilityData } from '@/features/characters/stores';
import type { AbilityReference as AbilityReferenceType } from '@/lib/abilityMatcher';
import { segmentText } from '@/lib/abilityMatcher';
import { useAttributesMap } from '@/stores/usePrimitivesStore';
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
  'CRIT Rate': 'var(--color-error-500)',
  'CRIT DMG': 'var(--color-warning-500)',
  ATK: 'var(--color-legendary-500)',
  HP: 'var(--color-success-500)',
  DEF: 'var(--color-geo-500)',
  'Energy Recharge': 'var(--color-electro-500)',
  'Elemental Mastery': 'var(--color-anemo-500)',
};

const STAT_ICONS: Record<string, React.ElementType> = {
  'CRIT Rate': Crosshair,
  'CRIT DMG': Flame,
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
  attributeUrlMap: Record<string, string>;
}

const StatText: React.FC<StatTextProps> = ({
  stat,
  Icon,
  color,
  attributeUrlMap,
}) => {
  const attributeUrl = attributeUrlMap[stat];

  return (
    <Text
      as="span"
      className="inline-flex items-center gap-1 opacity-90"
      style={{ color }}
      color={'inherit'}
    >
      {stat}
      {attributeUrl ? (
        <CachedImage
          src={attributeUrl}
          alt={stat}
          className="inline-block h-[0.8em] w-[0.8em]"
          lazy={false}
          showSkeleton={false}
        />
      ) : (
        Icon && (
          <Icon
            className="inline-block h-[0.8em] w-[0.8em]"
            aria-hidden="true"
          />
        )
      )}
    </Text>
  );
};

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
  const { attributeUrlMap } = useAttributesMap();

  const processedContent = useMemo(() => {
    const parts = text.split(TEXT_PATTERN).filter(Boolean);

    return parts.map((part, index) => {
      const statColor = STAT_COLORS[part];
      const StatIcon = STAT_ICONS[part];
      if (statColor && StatIcon) {
        return (
          <StatText
            key={`${index}-stat-${part}`}
            stat={part}
            Icon={StatIcon}
            color={statColor}
            attributeUrlMap={attributeUrlMap}
          />
        );
      }

      const lowercasePart = part.toLowerCase() as Element;
      const elementColor = ELEMENT_COLORS[lowercasePart];

      if (/^\d+%?$/.test(part)) {
        return (
          <Text as="span" key={`${index}-num-${part}`} color="gold">
            {part}
          </Text>
        );
      }

      return elementColor ? (
        <Text
          as="span"
          key={`${index}-elem-${lowercasePart}`}
          style={{ color: elementColor }}
        >
          {part}
        </Text>
      ) : (
        <React.Fragment key={`${index}-text`}>{part}</React.Fragment>
      );
    });
  }, [text, attributeUrlMap]);

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
  const { attributeUrlMap } = useAttributesMap();

  const abilityMap = propAbilityMap ?? storeData.abilityMap;
  const elementColor = propElementColor ?? storeData.elementColor;

  const processedContent = useMemo(() => {
    if (!abilityMap || abilityMap.size === 0) {
      return processTextSegment(text, attributeUrlMap);
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
            {processTextSegment(segment.content, attributeUrlMap)}
          </React.Fragment>
        );
      }
    });
  }, [text, abilityMap, elementColor, attributeUrlMap]);

  return <div className={className}>{processedContent}</div>;
};

/**
 * Processes a text segment for stat terms, element keywords, and numbers
 */
function processTextSegment(
  text: string,
  attributeUrlMap: Record<string, string>
): React.ReactNode[] {
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
          attributeUrlMap={attributeUrlMap}
        />
      );
    }

    // Then check for element match (case-insensitive)
    const lowercasePart = part.toLowerCase() as Element;
    const elementColor = ELEMENT_COLORS[lowercasePart];

    // Then check for numbers
    if (/^\d+%?$/.test(part)) {
      return (
        <Text
          as="span"
          key={`${index}-num-${part}`}
          color="warning"
          className="opacity-75"
        >
          {part}
        </Text>
      );
    }

    // Render element with color
    return elementColor ? (
      <Text
        as="span"
        key={`${index}-elem-${lowercasePart}`}
        style={{ color: elementColor }}
      >
        {part}
      </Text>
    ) : (
      <React.Fragment key={`${index}-text`}>{part}</React.Fragment>
    );
  });
}
