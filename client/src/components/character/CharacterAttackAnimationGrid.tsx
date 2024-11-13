import React from "react";
import { AnimationMedia, Talent } from "@/graphql/types";
import AnimatedCover from "./AnimatedCover";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import ListSplitter from "../utils/ListSplitter";

interface CharacterAttackAnimationGridProps {
  talent: Talent | undefined;
  animations: AnimationMedia[];
}

/**
 * CharacterAttackAnimationGrid component displays a grid of attack animations
 * associated with a character's talent.
 *
 * @param {CharacterAttackAnimationGridProps} props - The properties for the component.
 * @param {Talent | undefined} props.talent - The talent information of the character.
 * @param {AnimationMedia[]} props.animations - The list of animations to display.
 *
 * @returns {JSX.Element} A card component containing the talent information and animations.
 */
const CharacterAttackAnimationGrid: React.FC<
  CharacterAttackAnimationGridProps
> = ({ talent, animations }) => {
  return (
    <Card className="border-none bg-transparent">
      <CardHeader>
        <div className="flex items-center gap-2 border-b pb-2">
          <img
            className="h-8 w-8"
            src={talent?.talentIcon}
            alt={talent?.talentName}
          />
          <Tooltip>
            <TooltipTrigger>
              <CardTitle className="text-base text-yellow-100">
                {talent?.talentName}
                <span className="text-xs text-gray-400 ml-2">
                  {talent?.talentType}
                </span>
              </CardTitle>
            </TooltipTrigger>
            <TooltipContent
              className="max-w-xs p-4 bg-gray-900 rounded-lg"
              side="right"
            >
              <ListSplitter text={talent?.description || ""} />
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {animations.map((animation) => (
            <div key={animation.imageUrl}>
              <AnimatedCover animation={animation} />
              <p>{animation.caption}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterAttackAnimationGrid;
