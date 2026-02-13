import { Pipette } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { PRESET_TIER_COLORS } from '../../constants';

interface TierColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export const TierColorPicker: React.FC<TierColorPickerProps> = ({
  color,
  onChange,
  disabled = false,
}) => {
  const [hexInput, setHexInput] = useState(color);
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = (newColor: string) => {
    // Validate hex color format
    if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
      onChange(newColor);
      setHexInput(newColor);
    }
  };

  const handleHexInputChange = (value: string) => {
    setHexInput(value);
    // Auto-add # if user forgets
    const colorValue = value.startsWith('#') ? value : `#${value}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(colorValue)) {
      onChange(colorValue);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md border-2 border-white/30 hover:border-white/50 transition-colors shadow-md"
          style={{ backgroundColor: color }}
          disabled={disabled}
          title="Change tier color"
        >
          <Pipette className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="sr-only">Change color</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-72" align="start">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-2">Preset Colors</h4>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_TIER_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  onClick={() => handleColorChange(presetColor)}
                  className={cn(
                    'h-9 w-9 rounded-md border-2 transition-all',
                    'hover:scale-110 hover:shadow-md',
                    color === presetColor
                      ? 'border-white ring-2 ring-primary'
                      : 'border-gray-400/50 hover:border-gray-300'
                  )}
                  style={{ backgroundColor: presetColor }}
                  title={presetColor}
                  type="button"
                />
              ))}
            </div>
          </div>

          <div className="border-t pt-3">
            <h4 className="font-medium text-sm mb-2">Custom Color</h4>
            <div className="flex items-center gap-2">
              {/* Native color input */}
              <div className="relative">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-10 w-16 cursor-pointer p-1"
                  title="Pick custom color"
                />
              </div>

              {/* Hex text input */}
              <Input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexInputChange(e.target.value)}
                placeholder="#000000"
                className="flex-1 font-mono text-sm"
                maxLength={7}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Enter hex color (e.g., #ef4444)
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
