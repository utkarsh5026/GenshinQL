import html2canvas from 'html2canvas';
import { Download, Image, Share2 } from 'lucide-react';
import React, { useRef, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { Team } from '../../types';
import { TeamPreviewCard } from './team-preview';

interface TeamPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team;
}

export const TeamPreviewDialog: React.FC<TeamPreviewDialogProps> = ({
  open,
  onOpenChange,
  team,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);
  const [copied, setCopied] = useState(false);

  const capture = async (): Promise<HTMLCanvasElement | null> => {
    if (!cardRef.current) return null;
    setCapturing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#0a0d14',
        logging: false,
        windowWidth: 960,
        windowHeight: cardRef.current.scrollHeight,
      });
      return canvas;
    } finally {
      setCapturing(false);
    }
  };

  const handleDownload = async () => {
    const canvas = await capture();
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${team.name.replace(/\s+/g, '_')}_team.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = async () => {
    const canvas = await capture();
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }, 'image/png');
    } catch {
      handleDownload();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background/98">
        <DialogHeader className="px-5 pt-5 pb-0 flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Image className="w-4 h-4 text-muted-foreground" />
            Team Preview
          </DialogTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyToClipboard}
              disabled={capturing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border border-border/50 bg-accent/30 hover:bg-accent/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy Image'}
            </button>
            <button
              onClick={handleDownload}
              disabled={capturing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              {capturing ? 'Capturing...' : 'Download PNG'}
            </button>
          </div>
        </DialogHeader>

        {/* Scrollable preview area — scales the 960px card to fit the dialog */}
        <div className="flex-1 overflow-auto p-3 sm:p-5">
          <div className="overflow-x-auto">
            <div
              className="origin-top-left"
              style={{
                /* On mobile the dialog is ≈98vw; on desktop cap at max-w-5xl (960px). */
                /* We use a JS-free CSS zoom trick: the wrapper is the full dialog width,  */
                /* and the inner card scales to fill it proportionally.                    */
                width: '960px',
                transform: 'scale(var(--preview-scale, 1))',
              }}
              ref={(el) => {
                if (!el) return;
                const parent = el.parentElement;
                if (!parent) return;
                const scale = Math.min(1, parent.clientWidth / 960);
                el.style.transform = `scale(${scale})`;
                el.style.transformOrigin = 'top left';
                // Shrink the container so it doesn't leave a gap below
                el.parentElement!.style.height = `${el.offsetHeight * scale}px`;
              }}
            >
              <TeamPreviewCard ref={cardRef} team={team} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground/50 text-center mt-2">
            Preview is scaled for display. Downloaded image will be full
            resolution.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
