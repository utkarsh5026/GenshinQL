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

// Reactions and their constituent element color stops (left → right)
const REACTION_GRADIENTS: Record<string, string[]> = {
  Vaporize: ['var(--color-hydro-500)', 'var(--color-pyro-500)'],
  Melt: ['var(--color-pyro-500)', 'var(--color-cryo-500)'],

  Overloaded: ['var(--color-pyro-500)', 'var(--color-electro-500)'],
  'Electro-Charged': ['var(--color-electro-500)', 'var(--color-hydro-500)'],
  Superconduct: ['var(--color-cryo-500)', 'var(--color-electro-500)'],
  Frozen: ['var(--color-hydro-500)', 'var(--color-cryo-500)'],
  Shatter: ['var(--color-cryo-500)', 'var(--color-geo-500)'],
  Swirl: [
    'var(--color-anemo-500)',
    'var(--color-pyro-500)',
    'var(--color-anemo-500)',
  ],
  Crystallize: [
    'var(--color-geo-500)',
    'var(--color-cryo-500)',
    'var(--color-geo-500)',
  ],

  Burning: ['var(--color-dendro-500)', 'var(--color-pyro-500)'],
  Bloom: ['var(--color-dendro-500)', 'var(--color-hydro-500)'],
  Hyperbloom: ['var(--color-dendro-500)', 'var(--color-electro-500)'],
  Burgeon: ['var(--color-dendro-500)', 'var(--color-pyro-500)'],
  Quicken: ['var(--color-dendro-500)', 'var(--color-electro-500)'],
  Aggravate: ['var(--color-electro-500)', 'var(--color-dendro-500)'],
  Spread: ['var(--color-dendro-500)', 'var(--color-electro-500)'],
  // Lunar Reactions (Nod-Krai Moonsign mechanics)
  'Lunar-Charged': ['var(--color-starlight-200)', 'var(--color-electro-500)'],
  'Lunar-Bloom': ['var(--color-starlight-200)', 'var(--color-dendro-500)'],
  'Lunar-Crystallize': ['var(--color-starlight-200)', 'var(--color-geo-500)'],
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
      weight={'bold'}
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

const REACTION_NAMES = [
  'Lunar-Crystallize',
  'Lunar-Charged',
  'Lunar-Bloom',
  'Electro-Charged',
  'Superconduct',
  'Crystallize',
  'Hyperbloom',
  'Vaporize',
  'Overloaded',
  'Shatter',
  'Burning',
  'Burgeon',
  'Quicken',
  'Aggravate',
  'Frozen',
  'Spread',
  'Swirl',
  'Bloom',
  'Melt',
] as const;

const REACTION_NAMES_PATTERN = REACTION_NAMES.join('|');

const TEXT_PATTERN = new RegExp(
  `(Elemental Mastery|Energy Recharge|CRIT Rate|CRIT DMG|ATK|DEF|HP)|(${REACTION_NAMES_PATTERN})|\\b(dendro|pyro|hydro|electro|anemo|geo|cryo)\\b|(\\d+%?)`,
  'gi'
);

interface ReactionTextProps {
  name: string;
  colors: string[];
}

const ReactionText: React.FC<ReactionTextProps> = ({ name, colors }) => {
  const gradient = `linear-gradient(to right, ${colors.join(', ')})`;
  return (
    <Text
      as="span"
      weight="bold"
      style={{
        background: gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {name}
    </Text>
  );
};

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

      const reactionKey = REACTION_NAMES.find(
        (r) => r.toLowerCase() === part.toLowerCase()
      );
      if (reactionKey) {
        const gradientColors = REACTION_GRADIENTS[reactionKey];
        if (gradientColors) {
          return (
            <ReactionText
              key={`${index}-reaction-${reactionKey}`}
              name={part}
              colors={gradientColors}
            />
          );
        }
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

    const reactionKey = REACTION_NAMES.find(
      (r) => r.toLowerCase() === part.toLowerCase()
    );
    if (reactionKey) {
      const gradientColors = REACTION_GRADIENTS[reactionKey];
      if (gradientColors) {
        return (
          <ReactionText
            key={`${index}-reaction-${reactionKey}`}
            name={part}
            colors={gradientColors}
          />
        );
      }
    }

    const lowercasePart = part.toLowerCase() as Element;
    const elementColor = ELEMENT_COLORS[lowercasePart];

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
