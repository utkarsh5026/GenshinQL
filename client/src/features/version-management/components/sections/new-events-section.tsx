import { CalendarDays } from 'lucide-react';
import { useMemo } from 'react';

import { useNewEvents } from '../../stores';
import EventCard from '../cards/event-card';
import SectionContainer from '../section-container';

export default function NewEventsSection() {
  const events = useNewEvents();

  // Filter out events with no images and no rewards (minimal data)
  const visibleEvents = useMemo(
    () => events.filter((e) => e.images.length > 0 || e.rewards.length > 0),
    [events]
  );

  if (visibleEvents.length === 0) return null;

  return (
    <SectionContainer id="events" title="Events" icon={CalendarDays}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {visibleEvents.map((event) => (
          <EventCard key={event.name} event={event} />
        ))}
      </div>
    </SectionContainer>
  );
}
