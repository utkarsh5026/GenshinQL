import React, { memo, useMemo } from 'react';

type GenshinElement =
  | 'dendro'
  | 'pyro'
  | 'hydro'
  | 'electro'
  | 'anemo'
  | 'geo'
  | 'cryo';

const ELEMENT_COLORS: Record<GenshinElement, string> = {
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
const TextProcessor: React.FC<TextProcessorProps> = ({
  text,
  className = '',
}) => {
  const processedContent = useMemo(() => {
    const parts = text.split(TEXT_PATTERN).filter(Boolean);

    return parts.map((part, index) => {
      const lowercasePart = part.toLowerCase() as GenshinElement;
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
          className="font-bold"
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

export default memo(TextProcessor);
