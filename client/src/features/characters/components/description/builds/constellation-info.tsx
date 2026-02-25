import React from 'react';

import { Heading, Text } from '@/components/ui/text';
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
          <Text
            as="span"
            size="xs"
            weight="bold"
            uppercase
            className="px-2 py-1 rounded tracking-wider"
            style={{
              backgroundColor: `${elementColor}30`,
              color: elementColor,
            }}
          >
            C0
          </Text>
          <Text
            as="span"
            size="sm"
            weight="semibold"
            className="text-starlight-200"
          >
            Base Viability
          </Text>
        </div>
        <Text as="p" size="sm" color="muted" leading="relaxed">
          {constellations.c0}
        </Text>
      </div>

      {/* Constellation Breakpoints */}
      {constellations.breakpoints.length > 0 && (
        <div>
          <Heading
            level={4}
            size="sm"
            weight="semibold"
            uppercase
            className="tracking-wider mb-3"
            style={{ color: elementColor }}
          >
            Key Breakpoints
          </Heading>
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
                    <Text
                      as="span"
                      size="xs"
                      weight="bold"
                      className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                      style={{
                        backgroundColor: `${elementColor}30`,
                        color: elementColor,
                      }}
                    >
                      {constellation}
                    </Text>
                    <Text
                      as="p"
                      size="sm"
                      leading="relaxed"
                      className="text-starlight-200 pt-1"
                    >
                      {description}
                    </Text>
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
