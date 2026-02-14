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

  // Group wishes by phase
  const phaseGroups = useMemo(() => {
    const phase1 = validWishes.filter((w) => w.phase === 'Phase I');
    const phase2 = validWishes.filter((w) => w.phase === 'Phase II');
    return { phase1, phase2 };
  }, [validWishes]);

  if (validWishes.length === 0) return null;

  return (
    <SectionContainer id="banners" title="Event Wishes" icon={Sparkles}>
      {/* Phase I Group */}
      {phaseGroups.phase1.length > 0 && (
        <div className="mb-8 md:mb-10">
          <div className="mb-4 flex items-center justify-between border-l-2 border-celestial-500/30 pl-3 md:mb-4 md:pl-4">
            <h3 className="text-lg font-bold text-celestial-100 md:text-xl">
              Phase I
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {phaseGroups.phase1.map((wish) => (
              <BannerCard
                key={`${wish.bannerName}-${wish.phase}`}
                banner={wish}
              />
            ))}
          </div>
        </div>
      )}

      {/* Phase II Group */}
      {phaseGroups.phase2.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between border-l-2 border-celestial-500/30 pl-3 md:mb-4 md:pl-4">
            <h3 className="text-lg font-bold text-celestial-100 md:text-xl">
              Phase II
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {phaseGroups.phase2.map((wish) => (
              <BannerCard
                key={`${wish.bannerName}-${wish.phase}`}
                banner={wish}
              />
            ))}
          </div>
        </div>
      )}
    </SectionContainer>
  );
}
