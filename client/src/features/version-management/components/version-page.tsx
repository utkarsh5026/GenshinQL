import { useEffect } from 'react';

import { useVersionError, useVersionLoading, useVersionStore } from '../stores';
import EventWishesSection from './sections/event-wishes-section';
import GallerySection from './sections/gallery-section';
import NewAreasSection from './sections/new-areas-section';
import NewArtifactsSection from './sections/new-artifacts-section';
import NewCharactersSection from './sections/new-characters-section';
import NewEventsSection from './sections/new-events-section';
import NewWeaponsSection from './sections/new-weapons-section';
import SpiralAbyssSection from './sections/spiral-abyss-section';
import VersionHeroBanner from './version-hero-banner';

export default function VersionPage() {
  const fetchVersionData = useVersionStore((state) => state.fetchVersionData);
  const loading = useVersionLoading();
  const error = useVersionError();

  useEffect(() => {
    fetchVersionData();
  }, [fetchVersionData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-celestial-500/30 border-t-celestial-400" />
          <p className="text-lg text-muted-foreground">
            Loading version data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md rounded-xl border border-error-500/30 bg-error-900/20 p-8 text-center backdrop-blur-sm">
          <h2 className="mb-2 text-xl font-semibold text-error-300">
            Error Loading Version Data
          </h2>
          <p className="mb-4 text-sm text-error-200/80">{error.message}</p>
          <button
            onClick={() => fetchVersionData(false)}
            className="rounded-lg border border-error-500/30 bg-error-900/40 px-6 py-2 text-sm font-medium text-error-200 transition-colors hover:bg-error-900/60"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <VersionHeroBanner />

      {/* Content Sections */}
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <NewCharactersSection />
        <EventWishesSection />
        <NewWeaponsSection />
        <NewArtifactsSection />
        <NewEventsSection />
        <NewAreasSection />
        <SpiralAbyssSection />
        <GallerySection />
      </div>
    </div>
  );
}
