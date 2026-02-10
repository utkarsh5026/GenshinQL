import React, { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import TextProcessor from '@/components/utils/text-processor';
import { WeaponDetailedType } from '@/types';

interface WeaponProfileProps {
  weapon: WeaponDetailedType;
}

const WeaponProfile: React.FC<WeaponProfileProps> = ({ weapon }) => {
  // State for refinement level
  const [refinementLevel, setRefinementLevel] = useState<number>(1);

  // Get nation and weekday from weapon data
  const nations = [
    'N/A',
    'Mondstadt',
    'Liyue',
    'Inazuma',
    'Sumeru',
    'Fontaine',
    'Natlan',
    'NodKrai',
  ];
  const days = ['Monday/Thursday', 'Tuesday/Friday', 'Wednesday/Saturday'];

  const nation =
    weapon.nation >= 0 && weapon.nation < nations.length
      ? nations[weapon.nation]
      : 'N/A';
  const weekday =
    weapon.weekdays >= 0 && weapon.weekdays < days.length
      ? days[weapon.weekdays]
      : 'N/A';

  // Extract effect name from weapon effect
  const effectName = useMemo(() => {
    const firstLine = weapon.effect.split('\n')[0];
    return firstLine || 'Passive Effect';
  }, [weapon.effect]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Basic stats grid */}
      <div>
        <h2 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-foreground">
          Weapon Statistics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
          <Card className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
            <CardContent className="pt-3 md:pt-4 pb-2 md:pb-3">
              <h3 className="text-xs font-medium text-muted-foreground mb-1">
                Rarity
              </h3>
              <p className="text-xl md:text-2xl font-bold text-legendary-500">
                {weapon.rarity} ★
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
            <CardContent className="pt-3 md:pt-4 pb-2 md:pb-3">
              <h3 className="text-xs font-medium text-muted-foreground mb-1">
                Base Attack
              </h3>
              <p className="text-xl md:text-2xl font-bold text-pyro-500">
                {weapon.attack}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
            <CardContent className="pt-3 md:pt-4 pb-2 md:pb-3">
              <h3 className="text-xs font-medium text-muted-foreground mb-1">
                Secondary Stat
              </h3>
              <p className="text-base md:text-lg font-semibold text-electro-500">
                {weapon.subStat}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
            <CardContent className="pt-3 md:pt-4 pb-2 md:pb-3">
              <h3 className="text-xs font-medium text-muted-foreground mb-1">
                Nation
              </h3>
              <p className="text-base md:text-lg font-semibold text-hydro-500">
                {nation}
              </p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
            <CardContent className="pt-3 md:pt-4 pb-2 md:pb-3">
              <h3 className="text-xs font-medium text-muted-foreground mb-1">
                Material Availability
              </h3>
              <p className="text-sm md:text-base font-semibold text-geo-500">
                {weekday}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weapon Passive with Refinement Slider */}
      {weapon.passives && weapon.passives.length > 0 && (
        <Card className="border-border/50 bg-linear-to-br from-card/30 to-card/60">
          <CardContent className="pt-4 md:pt-6 pb-4 md:pb-5 space-y-3 md:space-y-4">
            <div>
              <h2 className="text-base md:text-lg font-bold text-foreground mb-1">
                Weapon Passive
              </h2>
              <p className="text-sm md:text-base font-semibold text-primary/90">
                {effectName}
              </p>
            </div>

            <div className="space-y-2 md:space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-4">
                <span className="text-xs md:text-sm font-medium text-muted-foreground min-w-fit">
                  Refinement Level
                </span>
                <Slider
                  value={[refinementLevel]}
                  onValueChange={(values) => setRefinementLevel(values[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="flex-1 w-full sm:w-auto"
                />
                <Badge
                  variant={refinementLevel === 5 ? 'default' : 'outline'}
                  className="min-w-10 md:min-w-12 justify-center text-sm md:text-base font-bold"
                >
                  R{refinementLevel}
                </Badge>
              </div>

              {refinementLevel === 5 && (
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="h-px flex-1 bg-linear-to-r from-transparent via-legendary-500 to-transparent" />
                  <span className="text-[0.625rem] md:text-xs font-semibold text-legendary-500 px-1 md:px-2 whitespace-nowrap">
                    ✦ MAXIMUM REFINEMENT ✦
                  </span>
                  <div className="h-px flex-1 bg-linear-to-r from-legendary-500 via-legendary-500 to-transparent" />
                </div>
              )}
            </div>

            <div className="pt-2 px-2 md:px-3 py-2 md:py-3 rounded-lg bg-background/30 border border-border/30">
              <TextProcessor text={weapon.passives[refinementLevel - 1]} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeaponProfile;
