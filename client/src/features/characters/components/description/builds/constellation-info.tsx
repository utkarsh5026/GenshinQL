import React from 'react';

import { ConstellationInfo as ConstellationInfoType } from '@/types';

interface ConstellationInfoProps {
  constellations: ConstellationInfoType;
  elementColor: string;
}

export const ConstellationInfo: React.FC<ConstellationInfoProps> = ({
  constellations,
  elementColor,
}) => {
  return (
    <div className="space-y-4">
      {/* C0 Analysis */}
      <div
        className="p-4 rounded-lg border"
        style={{
          borderColor: `${elementColor}30`,
          backgroundColor: `${elementColor}08`,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${elementColor}30`,
              color: elementColor,
            }}
          >
            C0
          </span>
          <span className="text-sm font-semibold text-starlight-200">
            Base Viability
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {constellations.c0}
        </p>
      </div>

      {/* Constellation Breakpoints */}
      {constellations.breakpoints.length > 0 && (
        <div>
          <h4
            className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: elementColor }}
          >
            Key Breakpoints
          </h4>
          <div className="space-y-3">
            {constellations.breakpoints.map((breakpoint, index) => {
              const match = breakpoint.match(/^(C\d+):\s*(.+)$/);
              const constellation = match ? match[1] : `C${index + 1}`;
              const description = match ? match[2] : breakpoint;

              return (
                <div
                  key={index}
                  className="p-3 rounded-lg border transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    borderColor: `${elementColor}20`,
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    boxShadow: `0 2px 8px ${elementColor}10`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold shrink-0"
                      style={{
                        backgroundColor: `${elementColor}30`,
                        color: elementColor,
                      }}
                    >
                      {constellation}
                    </span>
                    <p className="text-sm text-starlight-200 leading-relaxed pt-1">
                      {description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
