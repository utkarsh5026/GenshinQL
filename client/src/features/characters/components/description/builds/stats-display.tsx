import React from 'react';

import { Heading, Text } from '@/components/ui/text';
import { CharacterBuild } from '@/types';

interface StatsDisplayProps {
  mainStats: CharacterBuild['mainStats'];
  substats: string[];
  elementColor: string;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({
  mainStats,
  substats,
  elementColor,
}) => {
  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div>
        <Heading
          level={4}
          size="sm"
          weight="semibold"
          uppercase
          className="tracking-wider mb-4"
          style={{ color: elementColor }}
        >
          Main Stats
        </Heading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatColumn
            title="Sands"
            stats={mainStats.sands}
            elementColor={elementColor}
          />
          <StatColumn
            title="Goblet"
            stats={mainStats.goblet}
            elementColor={elementColor}
          />
          <StatColumn
            title="Circlet"
            stats={mainStats.circlet}
            elementColor={elementColor}
          />
        </div>
      </div>

      {/* Substats Priority */}
      <div>
        <Heading
          level={4}
          size="sm"
          weight="semibold"
          uppercase
          className="tracking-wider mb-3"
          style={{ color: elementColor }}
        >
          Substats Priority
        </Heading>
        <div className="flex flex-wrap gap-2">
          {substats.map((stat, index) => (
            <div
              key={stat}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 hover:-translate-y-0.5"
              style={{
                borderColor: `${elementColor}30`,
                backgroundColor: `${elementColor}10`,
                boxShadow: `0 2px 8px ${elementColor}10`,
              }}
            >
              <Text
                as="span"
                size="xs"
                weight="bold"
                className="flex items-center justify-center w-5 h-5 rounded-full"
                style={{
                  backgroundColor: `${elementColor}40`,
                  color: elementColor,
                }}
              >
                {index + 1}
              </Text>
              <Text
                as="span"
                size="sm"
                weight="medium"
                className="text-starlight-200"
              >
                {stat}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface StatColumnProps {
  title: string;
  stats: string[];
  elementColor: string;
}

const StatColumn: React.FC<StatColumnProps> = ({
  title,
  stats,
  elementColor,
}) => {
  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        borderColor: `${elementColor}20`,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
      }}
    >
      <Heading
        level={5}
        size="xs"
        weight="semibold"
        uppercase
        color="muted"
        className="tracking-wider mb-3"
      >
        {title}
      </Heading>
      <ul className="space-y-2">
        {stats.map((stat) => (
          <li
            key={stat}
            className="flex items-center gap-2 text-sm text-starlight-200"
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: elementColor }}
            />
            {stat}
          </li>
        ))}
      </ul>
    </div>
  );
};
