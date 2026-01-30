import { Character } from "@/types";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import AnimatedCover from "@/components/utils/AnimatedCover";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGenshinGuesserStore } from "@/stores";
import { cn } from "@/lib/utils";
import GameStats from "./GameStats";

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
  const { guessedChars, gameOver } = useGenshinGuesserStore();

  const guessCount = guessedChars.length;

  return (
    <Card className="border-none mt-16 bg-card/95 backdrop-blur-sm">
      <CardContent className="p-8 flex flex-col space-y-8">
        <div className="text-xl font-bold tracking-wide">
          <span className="text-muted-foreground">Guess: </span>
          <span
            className={cn(
              "font-mono text-2xl",
              guessCount >= 4 ? "text-game-wrong" : "text-genshin-gold"
            )}
          >
            {guessCount}/{MAX_GUESSES}
          </span>
        </div>

        {/* Show statistics when game is active */}
        {!gameOver && <GameStats />}

        {/* Show game over screen when game ends */}
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
                className="text-center space-y-2"
              >
                <div
                  className={cn(
                    "text-xl font-bold tracking-tight",
                    gameWon ? "text-game-correct" : "text-game-wrong"
                  )}
                >
                  {gameWon ? "Congratulations!" : "Better luck next time!"}
                </div>
                <div className="text-base text-muted-foreground flex items-center gap-2 justify-center">
                  <span>{gameWon ? "You guessed" : "The answer was"}</span>
                  <span className="font-semibold text-foreground">
                    {selectedCharacter.name}
                  </span>
                  <img
                    src={selectedCharacter.iconUrl}
                    alt={selectedCharacter.name}
                    className="w-6 h-6 rounded-full border border-border"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Button
                  variant="outline"
                  onClick={onReset}
                  className="flex items-center gap-2 hover:bg-accent/50 transition-colors duration-200"
                >
                  <RefreshCcw className="w-4 h-4" />
                  <span className="font-medium">Play again</span>
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
