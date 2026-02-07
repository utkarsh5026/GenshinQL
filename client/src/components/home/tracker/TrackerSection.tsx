import { Bookmark, Plus, Sword, User, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CachedImage } from '@/components/utils/CachedImage';
import { cn } from '@/lib/utils';
import {
  useCharacterMap,
  useTrackedCharacters,
  useTrackedWeapons,
  useTrackerStore,
  useWeaponMap,
} from '@/stores';
import type { TrackingReason } from '@/types';

const REASON_COLORS: Record<TrackingReason, string> = {
  building: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  farming: 'bg-green-500/20 text-green-400 border-green-500/50',
  wishlist: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
};

const REASON_LABELS: Record<TrackingReason, string> = {
  building: 'Building',
  farming: 'Farming',
  wishlist: 'Wishlist',
};

interface TrackedItemCardProps {
  name: string;
  iconUrl: string;
  reason: TrackingReason;
  type: 'character' | 'weapon';
  onRemove: () => void;
  onClick: () => void;
}

const TrackedItemCard: React.FC<TrackedItemCardProps> = ({
  name,
  iconUrl,
  reason,
  onRemove,
  onClick,
}) => {
  return (
    <div
      className={cn(
        'group relative flex flex-col items-center gap-2 p-3 rounded-xl',
        'bg-card/50 border border-border/50',
        'hover:bg-accent/30 hover:border-accent transition-all cursor-pointer'
      )}
      onClick={onClick}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className={cn(
          'absolute -top-2 -right-2 w-5 h-5 rounded-full',
          'bg-destructive/80 text-destructive-foreground',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'flex items-center justify-center hover:bg-destructive'
        )}
      >
        <X className="w-3 h-3" />
      </button>
      <CachedImage
        src={iconUrl}
        alt={name}
        width={56}
        height={56}
        className="w-12 h-12 md:w-14 md:h-14 rounded-lg"
      />
      <span className="text-xs text-center font-medium line-clamp-1 max-w-[70px]">
        {name}
      </span>
      <Badge
        variant="outline"
        className={cn('text-[10px] px-1.5 py-0', REASON_COLORS[reason])}
      >
        {REASON_LABELS[reason]}
      </Badge>
    </div>
  );
};

interface AddTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddTrackingDialog: React.FC<AddTrackingDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [search, setSearch] = useState('');
  const [selectedReason, setSelectedReason] =
    useState<TrackingReason>('building');
  const [activeTab, setActiveTab] = useState<'characters' | 'weapons'>(
    'characters'
  );

  const characterMap = useCharacterMap();
  const weaponMap = useWeaponMap();
  const trackedCharacters = useTrackedCharacters();
  const trackedWeapons = useTrackedWeapons();
  const { addCharacter, addWeapon } = useTrackerStore();

  const trackedCharacterNames = useMemo(
    () => new Set(trackedCharacters.map((c) => c.name)),
    [trackedCharacters]
  );

  const trackedWeaponNames = useMemo(
    () => new Set(trackedWeapons.map((w) => w.name)),
    [trackedWeapons]
  );

  const filteredCharacters = useMemo(() => {
    const characters = Object.values(characterMap);
    if (!search)
      return characters.filter((c) => !trackedCharacterNames.has(c.name));
    return characters.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) &&
        !trackedCharacterNames.has(c.name)
    );
  }, [characterMap, search, trackedCharacterNames]);

  const filteredWeapons = useMemo(() => {
    const weapons = Object.values(weaponMap);
    if (!search) return weapons.filter((w) => !trackedWeaponNames.has(w.name));
    return weapons.filter(
      (w) =>
        w.name.toLowerCase().includes(search.toLowerCase()) &&
        !trackedWeaponNames.has(w.name)
    );
  }, [weaponMap, search, trackedWeaponNames]);

  const handleAddCharacter = (name: string) => {
    addCharacter(name, selectedReason);
  };

  const handleAddWeapon = (name: string) => {
    addWeapon(name, selectedReason);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add to Tracker</DialogTitle>
          <DialogDescription>
            Select characters or weapons to track your progress
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mb-4">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            {(['building', 'farming', 'wishlist'] as TrackingReason[]).map(
              (reason) => (
                <Button
                  key={reason}
                  size="sm"
                  variant={selectedReason === reason ? 'default' : 'outline'}
                  onClick={() => setSelectedReason(reason)}
                  className={cn(
                    'flex-1 text-xs',
                    selectedReason === reason && REASON_COLORS[reason]
                  )}
                >
                  {REASON_LABELS[reason]}
                </Button>
              )
            )}
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'characters' | 'weapons')}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="w-full">
            <TabsTrigger value="characters" className="flex-1 gap-1">
              <User className="w-4 h-4" />
              Characters
            </TabsTrigger>
            <TabsTrigger value="weapons" className="flex-1 gap-1">
              <Sword className="w-4 h-4" />
              Weapons
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="characters"
            className="flex-1 overflow-y-auto mt-4"
          >
            <div className="grid grid-cols-4 gap-2">
              {filteredCharacters.slice(0, 24).map((char) => (
                <button
                  key={char.name}
                  onClick={() => handleAddCharacter(char.name)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg',
                    'hover:bg-accent/50 transition-colors'
                  )}
                >
                  <CachedImage
                    src={char.iconUrl}
                    alt={char.name}
                    width={48}
                    height={48}
                    className="w-10 h-10 rounded-lg"
                  />
                  <span className="text-[10px] text-center line-clamp-1 max-w-[60px]">
                    {char.name}
                  </span>
                </button>
              ))}
            </div>
            {filteredCharacters.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No characters found
              </div>
            )}
          </TabsContent>

          <TabsContent value="weapons" className="flex-1 overflow-y-auto mt-4">
            <div className="grid grid-cols-4 gap-2">
              {filteredWeapons.slice(0, 24).map((weapon) => (
                <button
                  key={weapon.name}
                  onClick={() => handleAddWeapon(weapon.name)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg',
                    'hover:bg-accent/50 transition-colors'
                  )}
                >
                  <CachedImage
                    src={weapon.iconUrl}
                    alt={weapon.name}
                    width={48}
                    height={48}
                    className="w-10 h-10 rounded-lg"
                  />
                  <span className="text-[10px] text-center line-clamp-1 max-w-[60px]">
                    {weapon.name}
                  </span>
                </button>
              ))}
            </div>
            {filteredWeapons.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No weapons found
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export const TrackerSection: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const trackedCharacters = useTrackedCharacters();
  const trackedWeapons = useTrackedWeapons();
  const characterMap = useCharacterMap();
  const weaponMap = useWeaponMap();
  const { removeCharacter, removeWeapon } = useTrackerStore();

  const hasTrackedItems =
    trackedCharacters.length > 0 || trackedWeapons.length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-lg">Your Tracker</CardTitle>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
        <CardDescription>
          Characters and weapons you're building or farming for
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasTrackedItems ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Bookmark className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No items tracked yet</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="mt-2"
            >
              Add your first item
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {trackedCharacters.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Characters ({trackedCharacters.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {trackedCharacters.map((tracked) => {
                    const char = characterMap[tracked.name];
                    if (!char) return null;
                    return (
                      <TrackedItemCard
                        key={tracked.name}
                        name={tracked.name}
                        iconUrl={char.iconUrl}
                        reason={tracked.reason}
                        type="character"
                        onRemove={() => removeCharacter(tracked.name)}
                        onClick={() => navigate(`/characters/${tracked.name}`)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {trackedWeapons.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Sword className="w-3 h-3" />
                  Weapons ({trackedWeapons.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {trackedWeapons.map((tracked) => {
                    const weapon = weaponMap[tracked.name];
                    if (!weapon) return null;
                    return (
                      <TrackedItemCard
                        key={tracked.name}
                        name={tracked.name}
                        iconUrl={weapon.iconUrl}
                        reason={tracked.reason}
                        type="weapon"
                        onRemove={() => removeWeapon(tracked.name)}
                        onClick={() =>
                          navigate(
                            `/weapons/${tracked.name.replace(/ /g, '_')}`
                          )
                        }
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <AddTrackingDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </Card>
  );
};

export default TrackerSection;
