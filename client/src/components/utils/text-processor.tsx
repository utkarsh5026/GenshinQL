import React from 'react';

interface TextProcessorProps {
  text: string;
}

/**
 * TextProcessor component processes a given text string and applies
 * specific styles to certain keywords and numbers/percentages.
 */
const TextProcessor: React.FC<TextProcessorProps> = ({ text }) => {
  const processText = (input: string) => {
    const elementColors: { [key: string]: string } = {
      dendro: 'var(--color-dendro-500)',
      pyro: 'var(--color-pyro-500)',
      hydro: 'var(--color-hydro-500)',
      electro: 'var(--color-electro-500)',
      anemo: 'var(--color-anemo-500)',
      geo: 'var(--color-geo-500)',
      cryo: 'var(--color-cryo-500)',
    };

    const parts = input.split(
      /(\b(?:dendro|pyro|hydro|electro|anemo|geo|cryo)\b)|(\d+%?)/i
    );

    return parts.filter(Boolean).map((part, index) => {
      const lowercasePart = part.toLowerCase();
      const color = elementColors[lowercasePart];

      // Check if the part is a number or percentage
      if (/^\d+%?$/.test(part)) {
        return (
          <span
            key={`number-${part}-${index}`}
            style={{ color: 'var(--color-warning-500)' }}
          >
            {part}
          </span>
        );
      }

      return color ? (
        <span
          key={`element-${part}-${index}`}
          style={{ color, fontWeight: 'bold' }}
        >
          {part}
        </span>
      ) : (
        part
      );
    });
  };

  return <div>{processText(text)}</div>;
};

export default TextProcessor;
