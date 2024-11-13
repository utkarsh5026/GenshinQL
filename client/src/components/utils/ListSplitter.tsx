import React from "react";
import TextProcessor from "./TextProcessor";

interface ListSplitterProps {
  text: string;
}

/**
 * ListSplitter component splits a given text into sentences and processes each sentence
 * using the TextProcessor component.
 *
 * @param {ListSplitterProps} props - The properties for the component.
 * @param {string} props.text - The text to be split into sentences.
 *
 * @returns {JSX.Element} A list of processed sentences.
 */
const ListSplitter: React.FC<ListSplitterProps> = ({ text }) => {
  // Split text into sentences using regex
  // This handles common sentence endings (., !, ?) followed by spaces
  const sentences = text
    .split(/[.!?]+\s+/)
    .filter((sentence) => sentence.trim().length > 0);

  return (
    <div className="space-y-2 p-4">
      <ul className="list-disc marker:text-lg space-y-2 text-left">
        {sentences.map((sentence, index) => (
          <li key={index} className="text-sm text-left text-gray-400">
            <TextProcessor text={sentence} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListSplitter;
