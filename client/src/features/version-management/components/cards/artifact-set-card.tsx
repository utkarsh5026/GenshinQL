import { useMemo } from 'react';

import type { VersionArtifact } from '../../types';
import { stripSoftHyphens } from '../../utils';

interface ArtifactSetCardProps {
  artifact: VersionArtifact;
}

export default function ArtifactSetCard({ artifact }: ArtifactSetCardProps) {
  const name = useMemo(() => stripSoftHyphens(artifact.name), [artifact.name]);

  return (
    <div className="overflow-hidden rounded-xl border border-midnight-700/50 bg-midnight-900/40 backdrop-blur-sm transition-all duration-300 hover:border-celestial-500/30">
      {/* Showcase Image */}
      {artifact.showcaseImage && (
        <div className="relative overflow-hidden">
          <img
            src={artifact.showcaseImage}
            alt={name}
            className="h-auto w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="space-y-4 p-5">
        {/* Set Name */}
        <h3 className="text-lg font-semibold text-celestial-200">{name}</h3>

        {/* Artifact Pieces */}
        <div className="flex gap-2">
          {artifact.pieces.map((piece) => (
            <div
              key={piece.type}
              className="group/piece relative"
              title={stripSoftHyphens(piece.name)}
            >
              <div className="h-10 w-10 overflow-hidden rounded-lg border border-midnight-600/50 bg-midnight-800/60 p-1">
                <img
                  src={piece.iconUrl}
                  alt={piece.name}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bonuses */}
        <div className="space-y-2">
          <div className="rounded-lg border border-success-500/20 bg-success-900/20 p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-success-300">
              2-Piece Bonus
            </p>
            <p className="text-sm text-success-100/90">
              {artifact.twoPieceBonus}
            </p>
          </div>
          <div className="rounded-lg border border-legendary-500/20 bg-legendary-900/20 p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-legendary-300">
              4-Piece Bonus
            </p>
            <p className="text-sm text-legendary-100/90">
              {artifact.fourPieceBonus}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
