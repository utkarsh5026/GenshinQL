import { Sparkles } from 'lucide-react';
import { useMemo } from 'react';

import { ListSplitter } from '@/components/utils/text';

import type { VersionArtifact } from '../../types';
import { stripSoftHyphens } from '../../utils';

interface ArtifactSetCardProps {
  artifact: VersionArtifact;
}

export default function ArtifactSetCard({ artifact }: ArtifactSetCardProps) {
  const name = useMemo(() => stripSoftHyphens(artifact.name), [artifact.name]);

  return (
    <div className="group/card overflow-hidden rounded-xl border border-midnight-700/50 bg-midnight-900/40 backdrop-blur-sm transition-all duration-300 hover:border-celestial-500/30 hover:shadow-lg hover:shadow-celestial-500/10">
      <div className="space-y-4 p-4 md:space-y-5 md:p-6">
        {/* Set Name with Icon */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-celestial-400 md:h-5 md:w-5" />
          <h3 className="text-base font-semibold text-celestial-200 md:text-lg">
            {name}
          </h3>
        </div>

        {/* Artifact Pieces */}
        <div className="flex gap-2 md:gap-2.5">
          {artifact.pieces.map((piece) => (
            <div
              key={piece.type}
              className="group/piece relative"
              title={stripSoftHyphens(piece.name)}
            >
              <div className="h-16 w-16 overflow-hidden rounded-lg border border-midnight-600/50 bg-midnight-800/60 p-1.5 transition-all duration-200 group-hover/piece:scale-110 group-hover/piece:border-celestial-500/40 group-hover/piece:shadow-md group-hover/piece:shadow-celestial-500/20 md:h-20 md:w-20">
                <img
                  src={piece.iconUrl}
                  alt={piece.name}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-midnight-950/95 px-2 py-1 text-xs text-celestial-200 opacity-0 transition-opacity duration-200 group-hover/piece:opacity-100">
                {stripSoftHyphens(piece.name)}
              </div>
            </div>
          ))}
        </div>

        {/* Bonuses */}
        <div className="space-y-3 md:space-y-4">
          {/* 2-Piece Bonus */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-celestial-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-celestial-300/80">
                2-Piece Bonus
              </p>
            </div>
            <ListSplitter text={artifact.twoPieceBonus} />
          </div>

          {/* 4-Piece Bonus */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-celestial-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-celestial-300/80">
                4-Piece Bonus
              </p>
            </div>
            <ListSplitter text={artifact.fourPieceBonus} />
          </div>
        </div>
      </div>
    </div>
  );
}
