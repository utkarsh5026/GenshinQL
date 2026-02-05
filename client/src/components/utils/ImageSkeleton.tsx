import { ImageIcon } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

interface ImageSkeletonProps {
  /** Size preset: sm (20px), md (40px), lg (64px) */
  size?: 'sm' | 'md' | 'lg';
  /** Shape of the skeleton */
  shape?: 'circle' | 'rounded' | 'square';
  /** Additional CSS classes */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

const sizeMap = {
  sm: { dimension: 'w-5 h-5', icon: 10 },
  md: { dimension: 'w-10 h-10', icon: 16 },
  lg: { dimension: 'w-16 h-16', icon: 24 },
};

const shapeMap = {
  circle: 'rounded-full',
  rounded: 'rounded-lg',
  square: 'rounded-none',
};

/**
 * Animated image skeleton with subtle shimmer and glow effects.
 * Used as a loading placeholder for images with a premium, game-themed feel.
 */
export const ImageSkeleton: React.FC<ImageSkeletonProps> = ({
  size = 'md',
  shape = 'circle',
  className,
  style,
}) => {
  const { dimension, icon } = sizeMap[size];
  const shapeClass = shapeMap[shape];

  return (
    <div
      className={cn(
        // Base styles
        'relative flex items-center justify-center overflow-hidden',
        'bg-gradient-to-br from-midnight-800/60 to-midnight-900/80',
        // Shape and size
        dimension,
        shapeClass,
        // Glow pulse animation
        'animate-pulse',
        // Ring for subtle border effect
        'ring-1 ring-celestial-500/20',
        className
      )}
      style={style}
    >
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
        }}
      />

      {/* Glow effect layer */}
      <div
        className="absolute inset-0 animate-[glow-pulse_3s_ease-in-out_infinite]"
        style={{
          background:
            'radial-gradient(circle at center, var(--color-celestial-500) 0%, transparent 70%)',
          opacity: 0.15,
        }}
      />

      {/* Centered icon placeholder */}
      <ImageIcon
        size={icon}
        className="text-celestial-400/40 z-10"
        strokeWidth={1.5}
      />
    </div>
  );
};

export default ImageSkeleton;
