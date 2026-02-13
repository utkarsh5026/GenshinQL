import React from 'react';

import { TextProcessor, TextProcessorWithAbilities } from './text-processor';

interface ListSplitterProps {
  text: string;
}

/**
 * ListSplitter component splits a given text into sentences and processes each sentence
 * using the TextProcessor component.
 */
export const ListSplitter: React.FC<ListSplitterProps> = ({ text }) => {
  const sentences = text
    .split(/[.!?]+\s+/)
    .filter((sentence) => sentence.trim().length > 0);

  return (
    <div className="space-y-3 p-4 rounded-lg bg-surface-200/30">
      <ul className="space-y-2.5 text-left">
        {sentences.map((sentence, index) => (
          <li
            key={index}
            className="group flex items-start gap-3 text-sm text-muted-foreground 
                       transition-all duration-200 hover:text-foreground
                       pl-1 py-1.5 rounded-md hover:bg-starlight-800/20"
          >
            <span
              className="mt-1.5 h-1.5 w-1.5 rounded-full bg-celestial-500 
                         shrink-0 transition-transform duration-200 
                         group-hover:scale-125 group-hover:bg-celestial-400"
            />
            <span className="leading-relaxed">
              <TextProcessor text={sentence} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
interface AbilitiesListSplitter {
  text: string;
  characterName: string;
}

/**
 * AbilitiesListSplitter component splits text into sentences and processes each sentence
 * using TextProcessorWithAbilities for ability reference highlighting.
 * Maintains the same styling as ListSplitter but with enhanced text processing.
 */
export const AbilitiesListSplitter: React.FC<AbilitiesListSplitter> = ({
  text,
  characterName,
}) => {
  const sentences = text
    .split(/[.!?]+\s+/)
    .filter((sentence) => sentence.trim().length > 0);

  return (
    <div className="space-y-3 p-4 rounded-lg bg-surface-200/30">
      <ul className="space-y-2.5 text-left">
        {sentences.map((sentence) => (
          <li
            key={sentence}
            className="group flex items-start gap-3 text-sm text-muted-foreground
                       transition-all duration-200 hover:text-foreground
                       pl-1 py-1.5 rounded-md hover:bg-starlight-800/20"
          >
            <span
              className="mt-1.5 h-1.5 w-1.5 rounded-full bg-celestial-500
                         shrink-0 transition-transform duration-200
                         group-hover:scale-125 group-hover:bg-celestial-400"
            />
            <span className="leading-relaxed">
              <TextProcessorWithAbilities
                text={sentence}
                characterName={characterName}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListSplitter;
