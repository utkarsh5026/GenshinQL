import React from 'react';

import TextProcessor from './text-processor';

interface ListSplitterProps {
  text: string;
}

/**
 * ListSplitter component splits a given text into sentences and processes each sentence
 * using the TextProcessor component.
 */
const ListSplitter: React.FC<ListSplitterProps> = ({ text }) => {
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
