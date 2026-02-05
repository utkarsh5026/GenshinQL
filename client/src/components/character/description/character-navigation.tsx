import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CachedImage } from '@/components/utils/CachedImage';
import { useCharacters } from '@/stores/useCharactersStore';

interface CharacterNavigationProps {
  currentCharacterName: string;
  elementColor: string;
}

/**
 * Navigation component for switching between characters with Prev/Next buttons
 * Supports keyboard navigation with Arrow Left/Right keys
 */
const CharacterNavigation: React.FC<CharacterNavigationProps> = ({
  currentCharacterName,
  elementColor,
}) => {
  const navigate = useNavigate();
  const characters = useCharacters();

  const sortedCharacters = useMemo(() => {
    return [...characters].sort((a, b) => a.name.localeCompare(b.name));
  }, [characters]);

  const currentIndex = useMemo(() => {
    return sortedCharacters.findIndex(
      (c) => c.name.toLowerCase() === currentCharacterName.toLowerCase()
    );
  }, [sortedCharacters, currentCharacterName]);

  const prevCharacter =
    currentIndex > 0 ? sortedCharacters[currentIndex - 1] : null;
  const nextCharacter =
    currentIndex < sortedCharacters.length - 1
      ? sortedCharacters[currentIndex + 1]
      : null;

  const navigateToCharacter = useCallback(
    (characterName: string) => {
      navigate(`/characters/${characterName}`);
    },
    [navigate]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' && prevCharacter) {
        e.preventDefault();
        navigateToCharacter(prevCharacter.name);
      } else if (e.key === 'ArrowRight' && nextCharacter) {
        e.preventDefault();
        navigateToCharacter(nextCharacter.name);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevCharacter, nextCharacter, navigateToCharacter]);

  if (sortedCharacters.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between gap-4 w-full mb-4">
        {/* Previous Character Button */}
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={() =>
                prevCharacter && navigateToCharacter(prevCharacter.name)
              }
              disabled={!prevCharacter}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg
                transition-all duration-200
                ${
                  prevCharacter
                    ? 'bg-midnight-800/50 hover:bg-midnight-700/60 border border-midnight-600/40 hover:border-opacity-60 cursor-pointer'
                    : 'bg-midnight-800/20 border border-midnight-700/20 cursor-not-allowed opacity-40'
                }
              `}
              style={
                prevCharacter ? { borderColor: `${elementColor}30` } : undefined
              }
            >
              <ChevronLeft className="w-4 h-4 text-starlight-400" />
              {prevCharacter && (
                <>
                  <Avatar className="w-6 h-6 border border-midnight-600/40">
                    <CachedImage
                      lazy
                      src={prevCharacter.iconUrl}
                      alt={prevCharacter.name}
                      className="w-full h-full object-cover rounded-full"
                      skeletonSize="sm"
                      skeletonShape="circle"
                    />
                  </Avatar>
                  <span className="text-sm text-starlight-300 hidden sm:inline max-w-[100px] truncate">
                    {prevCharacter.name}
                  </span>
                </>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="font-medium">
            {prevCharacter ? (
              <div className="flex items-center gap-2">
                <span>Previous: {prevCharacter.name}</span>
                <kbd className="px-1.5 py-0.5 text-xs bg-midnight-700 rounded">
                  ←
                </kbd>
              </div>
            ) : (
              'No previous character'
            )}
          </TooltipContent>
        </Tooltip>

        {/* Character Counter */}
        <div className="text-xs text-starlight-500 font-medium">
          {currentIndex + 1} / {sortedCharacters.length}
        </div>

        {/* Next Character Button */}
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={() =>
                nextCharacter && navigateToCharacter(nextCharacter.name)
              }
              disabled={!nextCharacter}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg
                transition-all duration-200
                ${
                  nextCharacter
                    ? 'bg-midnight-800/50 hover:bg-midnight-700/60 border border-midnight-600/40 hover:border-opacity-60 cursor-pointer'
                    : 'bg-midnight-800/20 border border-midnight-700/20 cursor-not-allowed opacity-40'
                }
              `}
              style={
                nextCharacter ? { borderColor: `${elementColor}30` } : undefined
              }
            >
              {nextCharacter && (
                <>
                  <span className="text-sm text-starlight-300 hidden sm:inline max-w-[100px] truncate">
                    {nextCharacter.name}
                  </span>
                  <Avatar className="w-6 h-6 border border-midnight-600/40">
                    <CachedImage
                      lazy
                      src={nextCharacter.iconUrl}
                      alt={nextCharacter.name}
                      className="w-full h-full object-cover rounded-full"
                      skeletonSize="sm"
                      skeletonShape="circle"
                    />
                  </Avatar>
                </>
              )}
              <ChevronRight className="w-4 h-4 text-starlight-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="font-medium">
            {nextCharacter ? (
              <div className="flex items-center gap-2">
                <span>Next: {nextCharacter.name}</span>
                <kbd className="px-1.5 py-0.5 text-xs bg-midnight-700 rounded">
                  →
                </kbd>
              </div>
            ) : (
              'No next character'
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default CharacterNavigation;
