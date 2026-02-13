import React from 'react';

import { TeamComp } from '@/types';

import { TeamCard } from './team-card';

interface TeamsDisplayProps {
  teams: TeamComp[];
  elementColor: string;
}

export const TeamsDisplay: React.FC<TeamsDisplayProps> = ({
  teams,
  elementColor,
}) => {
  if (teams.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
      {teams.map((team, index) => (
        <TeamCard
          key={team.name}
          team={team}
          elementColor={elementColor}
          index={index}
        />
      ))}
    </div>
  );
};
