import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';

import { Avatar } from '@/components/ui/avatar';
import { Heading, Text } from '@/components/ui/text';
import { AnimatedCover } from '@/components/utils';
import { CachedImage } from '@/features/cache/components/cached-asset';
import { useTalentCharMap } from '@/features/calendar/stores/useTalentBooksStore';
import { getCurrentDayName } from '@/features/home/utils';
import type { AnimationMedia, CharacterDetailed } from '@/types';

import { useCharacters } from '../../stores';
import CharacterAvatar from '../utils/character-avatar';

interface ProfileHeaderProps {
  name: string;
  avatarUrl: string;
  idleOne?: AnimationMedia;
  idleTwo?: AnimationMedia;
  fallbackCoverUrl?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  avatarUrl,
  idleOne,
  idleTwo,
  fallbackCoverUrl,
}) => {
  const [currentAnimation, setCurrentAnimation] = useState<'one' | 'two'>(
    'one'
  );

  const handleNextAnimation = () => {
    setCurrentAnimation(currentAnimation === 'one' ? 'two' : 'one');
  };

  return (
    <div className="relative w-full flex flex-col items-center rounded-xl overflow-hidden bg-midnight-800/50 border border-midnight-600/40 shadow-lg">
      <div className="w-full h-48 overflow-hidden relative group">
        <AnimatedCover
          animation={currentAnimation === 'one' ? idleOne : idleTwo}
          fallbackUrl={fallbackCoverUrl}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-t from-midnight-900/90 via-midnight-900/20 to-transparent pointer-events-none" />

        {idleTwo && (
          <button
            aria-label="Next animation"
            onClick={handleNextAnimation}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-midnight-800/70 backdrop-blur-sm text-starlight-300 p-2 rounded-full border border-starlight-600/30 hover:bg-midnight-700/80 hover:text-celestial-400 hover:border-celestial-500/50 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="relative -mt-12 z-10">
        <div
          className="p-1 rounded-full bg-linear-to-br from-celestial-400 via-celestial-500 to-celestial-600 shadow-lg"
          style={{ boxShadow: '0 0 20px rgba(255, 200, 100, 0.3)' }}
        >
          <Avatar className="h-20 w-20 border-2 border-midnight-900 bg-midnight-800">
            <CachedImage
              src={avatarUrl}
              alt={name}
              className="object-cover rounded-full"
              skeletonShape="circle"
              skeletonSize="lg"
            />
          </Avatar>
        </div>
      </div>

      <div className="mt-4 pb-4 text-center px-4">
        <Heading
          level={2}
          size="lg"
          weight="semibold"
          className="tracking-wide"
        >
          {name}
        </Heading>
        <div className="mt-1.5 w-12 h-0.5 mx-auto bg-linear-to-r from-transparent via-celestial-500/60 to-transparent rounded-full" />
      </div>
    </div>
  );
};

interface MobileProfileHeaderProps {
  character: CharacterDetailed;
  elementColor: string;
}

interface StatColumnProps {
  iconSrc: string;
  iconAlt: string;
  value: string;
  label: string;
  valueStyle?: React.CSSProperties;
}

const StatColumn: React.FC<StatColumnProps> = ({
  iconSrc,
  iconAlt,
  value,
  label,
  valueStyle,
}) => (
  <div className="flex flex-col items-center gap-1 flex-1 px-2">
    <CachedImage
      src={iconSrc}
      alt={iconAlt}
      className="w-5 h-5 object-contain"
    />
    <Text
      as="span"
      size="sm"
      weight="semibold"
      leading="tight"
      style={valueStyle}
    >
      {value}
    </Text>
    <Text
      as="span"
      color="muted"
      uppercase
      className="text-[10px] tracking-wide"
    >
      {label}
    </Text>
  </div>
);

export const MobileProfileHeader: React.FC<MobileProfileHeaderProps> = ({
  character,
  elementColor,
}) => {
  const talentCharMap = useTalentCharMap();
  const talentBook = talentCharMap[character.name];
  const today = getCurrentDayName();
  const navigate = useNavigate();
  const characters = useCharacters();

  const { prevChar, nextChar } = useMemo(() => {
    const sorted = [...characters].sort((a, b) => a.name.localeCompare(b.name));
    const idx = sorted.findIndex((c) => c.name === character.name);
    return {
      prevChar: idx > 0 ? sorted[idx - 1] : null,
      nextChar: idx < sorted.length - 1 ? sorted[idx + 1] : null,
    };
  }, [characters, character.name]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => nextChar && navigate(`/characters/${nextChar.name}`),
    onSwipedRight: () => prevChar && navigate(`/characters/${prevChar.name}`),
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
  });

  const isFarmableToday =
    today === 'Sunday' ||
    talentBook?.dayOne === today ||
    talentBook?.dayTwo === today;

  const abbrevDay = (day?: string) => day?.slice(0, 3) ?? '—';
  const talentDays = talentBook
    ? `${abbrevDay(talentBook.dayOne)} / ${abbrevDay(talentBook.dayTwo)}`
    : '—';

  const rarityNum = parseInt(character.rarity, 10) || 5;
  const rarityStars = '★'.repeat(rarityNum);
  const rarityColor = rarityNum === 5 ? '#f59e0b' : '#a78bfa';

  return (
    <div className="lg:hidden flex flex-col" {...swipeHandlers}>
      {/* Namecard cover */}
      <div
        className="relative w-full h-28 overflow-hidden"
        style={{
          backgroundImage: `url(${character.imageUrls.nameCard})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-midnight-950/95" />

        {prevChar && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-starlight-400/70 pointer-events-none">
            <ChevronLeft className="w-4 h-4 shrink-0" />
          </div>
        )}

        {nextChar && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-starlight-400/70 pointer-events-none">
            <ChevronRight className="w-4 h-4 shrink-0" />
          </div>
        )}
      </div>

      {/* Avatar + info */}
      <div className="flex flex-col items-center -mt-10 relative z-10 px-4 pb-4">
        <CharacterAvatar
          characterName={character.name}
          size="xl"
          showName={false}
          interactive={false}
          showElement={true}
        />

        <Heading
          level={2}
          size="lg"
          weight="semibold"
          className="tracking-wide mt-2"
        >
          {character.name}
        </Heading>
        <Text
          as="span"
          size="sm"
          className="tracking-widest mt-0.5"
          style={{ color: rarityColor }}
        >
          {rarityStars}
        </Text>

        <div className="flex items-stretch divide-x divide-border/60 mt-4 w-full max-w-xs">
          <StatColumn
            iconSrc={character.regionUrl}
            iconAlt={character.region}
            value={character.region}
            label="Nation"
          />
          <StatColumn
            iconSrc={character.weaponUrl}
            iconAlt={character.weaponType}
            value={character.weaponType}
            label="Weapon"
          />
          <StatColumn
            iconSrc={talentCharMap[character.name].philosophyUrl}
            iconAlt={character.element}
            value={talentDays}
            label="Talents"
            valueStyle={{ color: isFarmableToday ? '#4ade80' : elementColor }}
          />
        </div>
      </div>
    </div>
  );
};
