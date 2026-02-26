import React from 'react';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Text } from '@/components/ui/text';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CachedImage } from '@/features/cache';
import { useIsMobile } from '@/hooks/use-mobile';
import type { AbilityReference as AbilityReferenceType } from '@/lib/abilityMatcher';

import { ListSplitter } from './list-splitter';

interface AbilityReferenceProps {
  abilityName: string;
  reference: AbilityReferenceType;
  elementColor: string;
}

/**
 * Renders an ability name with icon marker.
 * - Desktop: hover tooltip with full description
 * - Mobile: tap to open bottom drawer with full detail + scaling
 */
export const AbilityReference: React.FC<AbilityReferenceProps> = (props) => {
  const isMobile = useIsMobile();
  return isMobile ? (
    <MobileAbilityReference {...props} />
  ) : (
    <DesktopAbilityReference {...props} />
  );
};

const DesktopAbilityReference: React.FC<AbilityReferenceProps> = ({
  abilityName,
  reference,
  elementColor,
}) => {
  const { talent } = reference;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help items-center gap-0.5">
            <Text as="span" weight="medium" className="opacity-90">
              {abilityName}
            </Text>
            <CachedImage
              src={talent.talentIcon}
              alt={talent.talentName}
              className="h-full w-full object-contain opacity-80"
              lazy={false}
              showSkeleton={false}
              style={{ width: '14px', height: '14px' }}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent
          className="max-w-sm p-3"
          style={{
            borderColor: `${elementColor}40`,
            boxShadow: `0 4px 12px ${elementColor}20`,
          }}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className="h-10 w-10 shrink-0 rounded-lg p-1.5"
              style={{
                background: `linear-gradient(135deg, ${elementColor}25, ${elementColor}10)`,
              }}
            >
              <CachedImage
                src={talent.talentIcon}
                alt={talent.talentName}
                className="h-full w-full object-contain"
              />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <Text
                size="sm"
                weight="semibold"
                leading="tight"
                className="mb-1"
              >
                {talent.talentName}
              </Text>
              <Text
                as="span"
                weight="medium"
                uppercase
                className="mb-2 inline-block rounded px-1.5 py-0.5 text-[10px]"
                style={{
                  backgroundColor: `${elementColor}20`,
                  color: elementColor,
                }}
              >
                {talent.talentType}
              </Text>
              <Text
                as="div"
                size="xs"
                color="muted"
                leading="relaxed"
                className="max-h-28 overflow-y-auto"
              >
                {talent.description}
              </Text>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const MobileAbilityReference: React.FC<AbilityReferenceProps> = ({
  abilityName,
  reference,
  elementColor,
}) => {
  const { talent } = reference;

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <span className="inline-flex cursor-pointer items-center gap-0.5">
          <Text as="span" weight="medium">
            {abilityName}
          </Text>
          <CachedImage
            src={talent.talentIcon}
            alt={talent.talentName}
            className="h-full w-full object-contain opacity-80"
            lazy={false}
            showSkeleton={false}
            style={{ width: '14px', height: '14px' }}
          />
        </span>
      </DrawerTrigger>

      <DrawerContent className="max-h-[85vh] overflow-hidden">
        <DrawerHeader className="flex flex-row items-center gap-3 pb-2">
          <div
            className="h-10 w-10 shrink-0 rounded-lg p-1.5"
            style={{
              background: `linear-gradient(135deg, ${elementColor}25, ${elementColor}10)`,
              boxShadow: `0 0 16px ${elementColor}20`,
            }}
          >
            <CachedImage
              src={talent.talentIcon}
              alt={talent.talentName}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <DrawerTitle className="truncate text-base leading-tight">
              {talent.talentName}
            </DrawerTitle>

            <DrawerDescription className="sr-only">
              {talent.talentType}
            </DrawerDescription>
            <Text
              as="span"
              weight="medium"
              uppercase
              className="mt-1 inline-block rounded px-1.5 py-0.5 text-[10px]"
              style={{
                backgroundColor: `${elementColor}20`,
                color: elementColor,
              }}
            >
              {talent.talentType}
            </Text>
          </div>
        </DrawerHeader>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-6">
          <ListSplitter text={talent.description} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
