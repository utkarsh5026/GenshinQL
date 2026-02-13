import { Sparkles } from 'lucide-react';
import { useMemo } from 'react';

import { useEventWishes } from '../../stores';
import BannerCard from '../cards/banner-card';
import SectionContainer from '../section-container';

export default function EventWishesSection() {
  const wishes = useEventWishes();

  const validWishes = useMemo(
    () => wishes.filter((w) => w.featuredCharacters.length > 0),
    [wishes]
  );

  if (validWishes.length === 0) return null;

  return (
    <SectionContainer id="banners" title="Event Wishes" icon={Sparkles}>
      <div className="space-y-6">
        {validWishes.map((wish) => (
          <BannerCard key={`${wish.bannerName}-${wish.phase}`} banner={wish} />
        ))}
      </div>
    </SectionContainer>
  );
}
