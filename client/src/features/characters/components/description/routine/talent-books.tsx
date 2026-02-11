import React from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import AvatarWithSkeleton from '@/components/utils/AvatarWithSkeleton';
import type { TalentBook } from '@/features/calendar';
import { Character } from '@/features/characters';

import CharacterAvatar from '../../utils/character-avatar';

interface TalentBooksShowCaseProps {
  talentBooks: TalentBook[];
}

const TalentBookCard: React.FC<{ iconUrl: string; name: string }> = ({
  iconUrl,
  name,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <AvatarWithSkeleton
            name={name}
            url={iconUrl}
            avatarClassName="w-8 h-8 bg-slate-800"
          />
        </TooltipTrigger>
        <TooltipContent>{name}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const TalentBooksShowCase: React.FC<TalentBooksShowCaseProps> = ({
  talentBooks,
}) => {
  return (
    <div className="flex flex-col gap-1">
      {talentBooks.map((book) => {
        const { teachingUrl, guideUrl, philosophyUrl, bookName } = book;

        return (
          <div
            key={book.name}
            className="flex flex-row items-center cursor-pointer hover:opacity-80"
          >
            <TalentBookCard
              iconUrl={teachingUrl}
              name={`Teaching of ${bookName}`}
            />
            <div className="ml-2">
              <TalentBookCard
                iconUrl={guideUrl}
                name={`Guide of ${bookName}`}
              />
            </div>
            <div className="ml-2">
              <TalentBookCard
                iconUrl={philosophyUrl}
                name={`Philosophy of ${bookName}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
interface TalentBooksWithCharactersProps {
  talentBooks: TalentBook[];
  talentBookToCharactersMap: Record<string, Character[]>;
}

/**
 * TalentBooksWithCharacters component displays talent books alongside character icons
 * showing which characters need each talent book.
 */
export const TalentBooksWithCharacters: React.FC<
  TalentBooksWithCharactersProps
> = ({ talentBooks, talentBookToCharactersMap }) => {
  return (
    <div className="flex flex-col gap-3">
      {talentBooks.map((book) => {
        const { teachingUrl, guideUrl, philosophyUrl, bookName } = book;
        const characters = talentBookToCharactersMap[guideUrl] || [];
        const visibleChars = characters.slice(0, 6);
        const remainingCount = characters.length - 6;

        return (
          <div
            key={book.name}
            className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4"
          >
            {/* Talent Books Section */}
            <div className="flex flex-col gap-1.5">
              <div className="md:hidden text-[10px] uppercase tracking-wider text-muted-foreground">
                Books
              </div>
              <div className="flex flex-row items-center gap-2">
                <TalentBookCard
                  iconUrl={teachingUrl}
                  name={`Teaching of ${bookName}`}
                />
                <TalentBookCard
                  iconUrl={guideUrl}
                  name={`Guide of ${bookName}`}
                />
                <TalentBookCard
                  iconUrl={philosophyUrl}
                  name={`Philosophy of ${bookName}`}
                />
              </div>
            </div>

            {/* Divider (desktop only) */}
            {characters.length > 0 && (
              <div className="hidden md:block w-px bg-border self-stretch" />
            )}

            {/* Characters Section */}
            {characters.length > 0 && (
              <div className="flex-1">
                <div className="md:hidden text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                  Characters
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {visibleChars.map((char) => (
                    <CharacterAvatar
                      key={char.name}
                      characterName={char.name}
                    />
                  ))}
                  {remainingCount > 0 && (
                    <div
                      className="flex items-center justify-center w-10 h-10 text-xs font-medium text-muted-foreground bg-surface-100 rounded-full border border-border cursor-help"
                      title={`${remainingCount} more character${remainingCount > 1 ? 's' : ''}`}
                    >
                      +{remainingCount}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default TalentBooksShowCase;
