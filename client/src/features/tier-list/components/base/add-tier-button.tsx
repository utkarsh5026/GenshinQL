import { Plus } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { PRESET_TIER_COLORS } from '../../constants';

interface AddTierButtonProps {
  onAdd: (name: string, color: string) => void;
  existingNames: string[];
}

export const AddTierButton: React.FC<AddTierButtonProps> = ({
  onAdd,
  existingNames,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tierName, setTierName] = useState('');
  const [tierColor, setTierColor] = useState(PRESET_TIER_COLORS[0]);
  const [error, setError] = useState('');

  const getNextDefaultName = (): string => {
    const commonTiers = ['SS', 'S', 'A', 'B', 'C', 'D', 'F'];
    const existingNamesLower = existingNames.map((n) => n.toLowerCase());

    for (const name of commonTiers) {
      if (!existingNamesLower.includes(name.toLowerCase())) {
        return name;
      }
    }
    let counter = 1;
    while (existingNamesLower.includes(`tier ${counter}`.toLowerCase())) {
      counter++;
    }
    return `Tier ${counter}`;
  };

  const getNextDefaultColor = (): string => {
    return PRESET_TIER_COLORS[existingNames.length % PRESET_TIER_COLORS.length];
  };

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Reset form when opening
      setTierName(getNextDefaultName());
      setTierColor(getNextDefaultColor());
      setError('');
    }
  };

  const validateTierName = (name: string): boolean => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Tier name cannot be empty');
      return false;
    }

    if (
      existingNames.some((n) => n.toLowerCase() === trimmedName.toLowerCase())
    ) {
      setError(`Tier "${trimmedName}" already exists`);
      return false;
    }

    if (trimmedName.length > 20) {
      setError('Tier name must be 20 characters or less');
      return false;
    }

    setError('');
    return true;
  };

  const handleCreate = () => {
    if (validateTierName(tierName)) {
      onAdd(tierName.trim(), tierColor);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="w-full my-4 border-2 border-dashed border-gray-400 hover:border-gray-300 hover:bg-slate-800/50"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Tier
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="center">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-3">Create New Tier</h4>
          </div>

          {/* Tier Name Input */}
          <div className="space-y-2">
            <label htmlFor="tier-name" className="text-sm font-medium">
              Tier Name
            </label>
            <Input
              id="tier-name"
              value={tierName}
              onChange={(e) => {
                setTierName(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g., SS, F, Top"
              maxLength={20}
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tier Color</label>
            <div className="flex items-center gap-2">
              {/* Color Preview */}
              <div
                className="h-10 w-10 rounded-md border-2 border-white/30 shadow-md shrink-0"
                style={{ backgroundColor: tierColor }}
              />

              {/* Native Color Picker */}
              <Input
                type="color"
                value={tierColor}
                onChange={(e) => setTierColor(e.target.value)}
                className="h-10 w-20 cursor-pointer p-1"
              />

              {/* Hex Input */}
              <Input
                type="text"
                value={tierColor}
                onChange={(e) => {
                  const value = e.target.value.startsWith('#')
                    ? e.target.value
                    : `#${e.target.value}`;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                    setTierColor(value);
                  }
                }}
                placeholder="#000000"
                className="flex-1 font-mono text-sm"
                maxLength={7}
              />
            </div>

            {/* Preset Colors */}
            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {PRESET_TIER_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setTierColor(color)}
                  className={`
                    h-8 w-8 rounded-md border-2 transition-all
                    hover:scale-110
                    ${
                      tierColor === color
                        ? 'border-white ring-2 ring-primary'
                        : 'border-gray-400/50'
                    }
                  `}
                  style={{ backgroundColor: color }}
                  title={color}
                  type="button"
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              className="flex-1"
              disabled={!tierName.trim()}
            >
              Create Tier
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
