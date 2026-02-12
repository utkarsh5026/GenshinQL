import { CachedImage } from '@/features/cache';

type DisplaySize = 'sm' | 'md' | 'lg';

interface TabDisplayProps {
  element: string;
  elementUrl: string;
  size?: DisplaySize;
  showLabel?: boolean;
}

export const TabDisplay: React.FC<TabDisplayProps> = ({
  element,
  elementUrl,
  size = 'md',
  showLabel = true,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const iconSize = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center space-x-2">
      <CachedImage
        src={elementUrl}
        alt={element}
        width={iconSize[size]}
        height={iconSize[size]}
        className={`rounded-full ${sizeClasses[size]}`}
      />
      {showLabel && <span className={textSize[size]}>{element}</span>}
    </div>
  );
};
