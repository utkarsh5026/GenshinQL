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

const TEXT_PATTERN =
  /(\b(?:dendro|pyro|hydro|electro|anemo|geo|cryo)\b)|(\d+%?)/gi;

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
      const lowercasePart = part.toLowerCase() as Element;
      const elementColor = ELEMENT_COLORS[lowercasePart];

      if (/^\d+%?$/.test(part)) {
        return (
          <span key={`${index}-num-${part}`} className="text-warning-500">
            {part}
          </span>
        );
      }

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
 * Processes a text segment for element keywords and numbers
 * (Same logic as original TextProcessor)
 */
function processTextSegment(text: string): React.ReactNode[] {
  const parts = text.split(TEXT_PATTERN).filter(Boolean);

  return parts.map((part, index) => {
    const lowercasePart = part.toLowerCase() as Element;
    const elementColor = ELEMENT_COLORS[lowercasePart];

    if (/^\d+%?$/.test(part)) {
      return (
        <span key={`${index}-num-${part}`} className="text-warning-500">
          {part}
        </span>
      );
    }

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
