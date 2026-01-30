import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import { Talent } from '@/types';

import TextProcessor from '../../utils/TextProcessor.tsx';

interface CharacterPassivesProps {
  passives: Talent[];
}

/**
 * CharacterPassives component displays a list of passive talents for a character.
 *
 * @param {CharacterPassivesProps} props - The props for the component.
 * @param {Talent[]} props.passives - An array of passive talents to be displayed.
 * @returns {JSX.Element} A React component that renders the passive talents in a card format.
 */
const CharacterPassives: React.FC<CharacterPassivesProps> = ({ passives }) => {
  const sortPassives = (a: Talent, b: Talent): number => {
    const order = {
      '1st Ascension Passive': 1,
      '4th Ascension Passive': 2,
      'Utility Passive': 3,
    };

    return (
      (order[a.talentType as keyof typeof order] || 999) -
      (order[b.talentType as keyof typeof order] || 999)
    );
  };

  return (
    <div className="flex flex-col gap-4 text-sm">
      {passives.sort(sortPassives).map((passive) => (
        <Card key={passive.talentName}>
          <CardHeader>
            <div className="flex items-center gap-2 border-b pb-2">
              <img
                className="h-8 w-8"
                src={passive.talentIcon}
                alt={passive.talentName}
              />
              <CardTitle className="text-base text-yellow-100">
                {passive.talentName}
              </CardTitle>
              <CardDescription className="text-xs text-gray-400 font-thin">
                ({passive.talentType})
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-sm font-thin">
            <TextProcessor text={passive.description} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CharacterPassives;
