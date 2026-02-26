import React from 'react';

import { Text } from '@/components/ui/text';

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
    <div className="space-y-2 sm:space-y-4 p-2 sm:p-5 md:p-6 rounded-lg bg-surface-200/30">
      <ul className="space-y-2 sm:space-y-3.5 md:space-y-4 text-left max-w-4xl">
        {sentences.map((sentence, index) => (
          <Text
            as="li"
            key={index}
            size="sm"
            leading="relaxed"
            className="group flex items-start gap-2 sm:gap-3.5 md:gap-4
                       sm:text-base md:text-base
                       text-foreground/40 sm:leading-loose
                       transition-all duration-200 hover:text-foreground/10
                       pl-1 py-1.5 sm:py-2.5 rounded-md hover:bg-starlight-800/20
                       antialiased"
          >
            <span
              className="mt-1.5 sm:mt-2 h-1.5 w-1.5 sm:h-2 sm:w-2
                         rounded-full bg-celestial-500/50
                         shrink-0 transition-transform duration-200
                         group-hover:scale-125 group-hover:bg-celestial-400/70"
            />
            <Text
              as="span"
              color="inherit"
              leading="relaxed"
              className="sm:leading-loose tracking-wide"
            >
              <TextProcessor text={sentence} />
            </Text>
          </Text>
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
    <div className="space-y-2 sm:space-y-4 p-2 sm:p-5 md:p-6 rounded-lg bg-surface-200/30">
      <ul className="space-y-2 sm:space-y-3.5 md:space-y-4 text-left max-w-4xl">
        {sentences.map((sentence) => (
          <Text
            as="li"
            key={sentence}
            size="sm"
            leading="relaxed"
            className="group flex items-start gap-2 sm:gap-3.5 md:gap-4
                       sm:text-base md:text-base
                       text-foreground/80 sm:leading-loose
                       transition-all duration-200 hover:text-foreground/80
                       pl-1 py-1.5 sm:py-2.5 rounded-md hover:bg-starlight-800/20
                       antialiased"
          >
            <span
              className="mt-1.5 sm:mt-2 h-1.5 w-1.5 sm:h-2 sm:w-2
                         rounded-full bg-celestial-500/40 shrink-0"
            />
            <Text
              as="span"
              color="inherit"
              leading="relaxed"
              className="sm:leading-loose tracking-wide"
            >
              <TextProcessorWithAbilities
                text={sentence}
                characterName={characterName}
              />
            </Text>
          </Text>
        ))}
      </ul>
    </div>
  );
};

export default ListSplitter;
