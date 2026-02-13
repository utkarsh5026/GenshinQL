import { ChevronDown, ChevronUp, X } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import type { TierConfig } from '../../types';
import { TierColorPicker } from './TierColorPicker';

interface TierHeaderProps {
  tier: TierConfig;
  onColorChange: (color: string) => void;
  onNameChange: (name: string) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
}

export const TierHeader: React.FC<TierHeaderProps> = ({
  tier,
  onColorChange,
  onNameChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  canDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState(tier.name);

  const startEditing = () => {
    setEditableName(tier.name);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedName = editableName.trim();
    if (trimmedName && trimmedName !== tier.name) {
      onNameChange(trimmedName);
    } else {
      // Revert if empty or unchanged
      setEditableName(tier.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditableName(tier.name);
      setIsEditing(false);
    }
  };

  return (
    <div
      className="
        group
        flex items-center gap-2 px-3 py-2 min-w-32
        transition-colors duration-200
        relative
      "
      style={{ backgroundColor: tier.color }}
    >
      {/* Color Picker */}
      <TierColorPicker color={tier.color} onChange={onColorChange} />

      {/* Tier Name Editor */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editableName}
            onChange={(e) => setEditableName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="
              h-8 px-2 py-1
              bg-white/20 backdrop-blur-sm
              border-white/30 focus:border-white/50
              text-white font-bold text-lg
              placeholder:text-white/50
            "
            autoFocus
            maxLength={20}
          />
        ) : (
          <button
            onClick={startEditing}
            className={cn(
              'w-full text-left px-2 py-1 rounded',
              'font-bold text-lg text-white',
              'hover:bg-white/10 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-white/30'
            )}
            title="Click to edit tier name"
          >
            {tier.name}
          </button>
        )}
      </div>

      {/* Controls (show on hover) */}
      <div
        className={cn(
          'flex items-center gap-1',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-200'
        )}
      >
        {/* Move Up Button */}
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-white hover:bg-white/20"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          title="Move tier up"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>

        {/* Move Down Button */}
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-white hover:bg-white/20"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          title="Move tier down"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>

        {/* Delete Button */}
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-white hover:bg-red-500/30"
          onClick={onDelete}
          disabled={!canDelete}
          title={canDelete ? 'Delete tier' : 'Cannot delete last tier'}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
