import { Sparkles } from 'lucide-react';
import React from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CachedImage } from '@/features/cache';
import type { AbilityReference as AbilityReferenceType } from '@/lib/abilityMatcher';

interface AbilityReferenceProps {
  abilityName: string;
  reference: AbilityReferenceType;
  elementColor: string;
}

/**
 * Renders an ability name with a subtle icon marker and tooltip
 * Tooltip shows ability icon, name, type, and short description
 */
export const AbilityReference: React.FC<AbilityReferenceProps> = ({
  abilityName,
  reference,
  elementColor,
}) => {
  const { talent, shortDescription } = reference;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-0.5 cursor-help">
            <span className="font-medium">{abilityName}</span>
            <Sparkles
              className="inline-block opacity-60 shrink-0"
              style={{
                width: '8px',
                height: '8px',
                color: elementColor,
              }}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent
          className="max-w-xs p-3"
          style={{
            borderColor: `${elementColor}40`,
            boxShadow: `0 4px 12px ${elementColor}20`,
          }}
        >
          <div className="flex items-start gap-2">
            {/* Ability Icon */}
            <div
              className="shrink-0 w-6 h-6 rounded-md p-1"
              style={{
                background: `linear-gradient(135deg, ${elementColor}25, ${elementColor}10)`,
              }}
            >
              <CachedImage
                src={talent.talentIcon}
                alt={talent.talentName}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm leading-tight mb-1">
                {talent.talentName}
              </div>
              <div
                className="text-[10px] font-medium uppercase tracking-wide mb-1.5 opacity-70"
                style={{ color: elementColor }}
              >
                {talent.talentType}
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                {shortDescription}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
