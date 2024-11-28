import { Character } from "@/graphql/types";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import AnimatedCover from "@/components/utils/AnimatedCover";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import useGenshinGuesser from "@/redux/hook/genshin-guesser";

const MAX_GUESSES = 5;

interface GameOverDisplayProps {
  selectedCharacter: Character;
  gameWon: boolean;
  onReset: () => void;
}

const GameOverDisplay: React.FC<GameOverDisplayProps> = ({
  selectedCharacter,
  gameWon,
  onReset,
}) => {
  const { guessedChars, gameOver } = useGenshinGuesser();

  const guessCount = guessedChars.length;

  return (
    <Card>
      <CardContent className="p-4 flex flex-col gap-8">
        <div className="text-lg">
          <span>Guess: </span>
          <span className="font-bold text-yellow-700">{`${guessCount}/${MAX_GUESSES}`}</span>
        </div>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [20, 0],
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              scale: {
                type: "spring",
                damping: 8,
                stiffness: 100,
              },
            }}
          >
            <div className="text-sm text-gray-500 flex flex-col items-center gap-4">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: [0, 1.5, 1] }}
                transition={{
                  type: "spring",
                  damping: 10,
                  stiffness: 100,
                  delay: 0.2,
                }}
              >
                <Avatar className="w-36 h-36">
                  <AnimatedCover
                    animation={selectedCharacter.partyJoin}
                    fallbackUrl={selectedCharacter.iconUrl}
                  />
                </Avatar>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="font-bold"
              >
                <span
                  className={`${gameWon ? "text-green-700" : "text-red-700"}`}
                >
                  {gameWon
                    ? `Congrats! You correctly guessed ${selectedCharacter.name} 🎉`
                    : `The correct answer is ${selectedCharacter.name} 🥺`}
                </span>
                <img
                  src={selectedCharacter.iconUrl}
                  alt={selectedCharacter.name}
                  className="w-6 h-6 inline-block ml-2 align-text-bottom"
                />
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Button
                  variant="outline"
                  onClick={onReset}
                  className="flex items-center bg-gray-900"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" /> Play again
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default GameOverDisplay;
