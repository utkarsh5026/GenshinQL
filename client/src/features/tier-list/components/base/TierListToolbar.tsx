import { HelpCircle, RotateCcw } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TierListToolbarProps {
  onReset: () => void;
}

export const TierListToolbar: React.FC<TierListToolbarProps> = ({
  onReset,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    onReset();
    setShowResetConfirm(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 px-4 py-3 bg-secondary/20 rounded-lg border border-secondary/30">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResetConfirm(true)}
            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <div className="space-y-2 text-sm">
              <p className="font-semibold">How to use:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Drag characters between tiers to rank them</li>
                <li>Click tier names to rename</li>
                <li>Click color circles to customize tier colors</li>
                <li>Use arrows to reorder tiers</li>
                <li>Click + to add new tiers</li>
                <li>Your rankings are saved automatically</li>
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Tier List?</DialogTitle>
            <DialogDescription>
              This will restore the default tiers (S, A, B, C, D) and move all
              characters back to the unassigned pool. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResetConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
