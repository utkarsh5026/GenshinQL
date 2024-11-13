import React from "react";

interface TextProcessorProps {
  text: string;
}

/**
 * TextProcessor component processes a given text string and applies
 * specific styles to certain keywords and numbers/percentages.
 *
 * @param {TextProcessorProps} props - The props for the component.
 * @param {string} props.text - The text to be processed and displayed.
 * @returns {JSX.Element} A React component that displays the processed text.
 */
const TextProcessor: React.FC<TextProcessorProps> = ({ text }) => {
  const processText = (input: string) => {
    const elementColors: { [key: string]: string } = {
      dendro: "#2ecc71",
      pyro: "#e74c3c",
      hydro: "#3498db",
      electro: "#9b59b6",
      anemo: "#1abc9c",
      geo: "#f1c40f",
      cryo: "#ecf0f1",
    };

    const parts = input.split(
      /(\b(?:dendro|pyro|hydro|electro|anemo|geo|cryo)\b)|(\d+%?)/i
    );

    console.log(parts);

    return parts.filter(Boolean).map((part, index) => {
      const lowercasePart = part.toLowerCase();
      const color = elementColors[lowercasePart];

      // Check if the part is a number or percentage
      if (/^\d+%?$/.test(part)) {
        return (
          <span key={index} style={{ color: "#f39c12" }}>
            {part}
          </span>
        );
      }

      return color ? (
        <span key={index} style={{ color, fontWeight: "bold" }}>
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
