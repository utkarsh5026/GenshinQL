import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGenshinGuesserStore } from "@/stores";
import { motion } from "framer-motion";
import { Trophy, Target, Flame, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const GameStats: React.FC = () => {
  const { stats } = useGenshinGuesserStore();

  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  const maxGuessCount = Math.max(...Object.values(stats.guessDistribution));

  return (
    <Card className="border-none bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-genshin-gold" />
          Statistics
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="Played"
            value={stats.gamesPlayed}
            delay={0}
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Win Rate"
            value={`${winRate}%`}
            delay={0.1}
          />
          <StatCard
            icon={<Flame className="w-5 h-5 text-orange-500" />}
            label="Current Streak"
            value={stats.currentStreak}
            delay={0.2}
            highlight={stats.currentStreak > 0}
          />
          <StatCard
            icon={<Trophy className="w-5 h-5 text-genshin-gold" />}
            label="Max Streak"
            value={stats.maxStreak}
            delay={0.3}
          />
        </div>

        {/* Guess Distribution */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Guess Distribution
          </div>
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5].map((num) => {
              const count = stats.guessDistribution[num] || 0;
              const percentage =
                maxGuessCount > 0 ? (count / maxGuessCount) * 100 : 0;

              return (
                <div key={num} className="flex items-center gap-2">
                  <span className="text-xs font-mono w-3 text-muted-foreground">
                    {num}
                  </span>
                  <div className="flex-1 h-7 bg-muted rounded-md overflow-hidden relative">
                    <motion.div
                      className="h-full rounded-md flex items-center justify-end pr-2 bg-game-correct-bg"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(percentage, count > 0 ? 15 : 0)}%` }}
                      transition={{ duration: 0.6, delay: num * 0.1 }}
                    >
                      {count > 0 && (
                        <span className="text-xs font-bold text-white">
                          {count}
                        </span>
                      )}
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delay: number;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  delay,
  highlight,
}) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "p-3 rounded-lg border transition-all duration-200",
        "hover:shadow-md hover:scale-105 cursor-default",
        highlight
          ? "bg-game-correct-bg/20 border-game-correct"
          : "bg-muted/50 border-border"
      )}
    >
      <div className="flex items-center gap-2 mb-1 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold font-mono">{value}</div>
    </motion.div>
  );
};

export default GameStats;
