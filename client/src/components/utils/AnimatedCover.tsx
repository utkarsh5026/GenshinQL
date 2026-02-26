import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { CachedImage } from '@/features/cache';
import { useSharedIntersectionObserver } from '@/hooks/useSharedIntersectionObserver';
import { AnimationMedia } from '@/types';
import { addListeners } from '@/utils/listener';

interface AnimatedCoverProps {
  animation?: AnimationMedia;
  fallbackUrl?: string;
  className?: string;
}

export const AnimatedCover: React.FC<AnimatedCoverProps> = ({
  animation,
  fallbackUrl,
  className = '',
}) => {
  const [loadedVideoUrl, setLoadedVideoUrl] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const generationRef = useRef(0);
  const isInViewRef = useRef(false);

  const isVideoReady =
    loadedVideoUrl !== null && loadedVideoUrl === animation?.videoUrl;

  /** Track whether the component is visible in the viewport */
  const isInView = useSharedIntersectionObserver(
    containerRef as React.RefObject<Element>,
    { threshold: 0.25 }
  );

  /**
   * Mirror isInView into a ref so video event callbacks can read it
   * without capturing a stale closure value.
   */
  useEffect(() => {
    isInViewRef.current = isInView;
  }, [isInView]);

  /**
   * Play or pause whenever visibility or ready-state changes
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoReady) return;

    if (isInView) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isInView, isVideoReady]);

  /**
   *  Load video when URL changes; clean up fully on unmount or URL change
   */
  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      video.pause();
      video.currentTime = 0;
      video.removeAttribute('src');
      video.load();
    }

    if (!animation?.videoUrl || !video) return;

    const generation = ++generationRef.current;
    const videoUrl = animation.videoUrl;

    /** Marks the video ready only once the entire file is in the buffer. */
    const checkFullyDownloaded = () => {
      if (generationRef.current !== generation) return;
      if (
        !video.duration ||
        !isFinite(video.duration) ||
        !video.buffered.length
      )
        return;
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      if (bufferedEnd >= video.duration - 0.1) {
        setLoadedVideoUrl(videoUrl);
        setIsBuffering(false);
      }
    };

    const handleBuffering = () => {
      if (generationRef.current !== generation) return;
      setIsBuffering(true);
    };

    const handleResume = () => {
      if (generationRef.current !== generation) return;
      setIsBuffering(false);
    };

    const removeListeners = addListeners(video, {
      loadedmetadata: checkFullyDownloaded,
      progress: checkFullyDownloaded,
      error: handleResume,
      playing: handleResume,
      stalled: handleBuffering,
      waiting: handleBuffering,
    });

    video.src = videoUrl;
    video.load();

    return () => {
      removeListeners();

      setIsBuffering(false);
      video.pause();
      video.currentTime = 0;
      video.removeAttribute('src');
      video.load();
    };
  }, [animation?.videoUrl]);

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden relative ${className}`}
    >
      {animation ? (
        <>
          {/* Show the GIF/image until the video is fully buffered and ready */}
          {!isVideoReady && animation.imageUrl && (
            <CachedImage
              src={animation.imageUrl}
              alt="Animation Preview"
              className="w-full object-cover"
              style={{ display: 'block', width: '100%' }}
              skeletonShape="square"
              skeletonSize="lg"
            />
          )}

          {animation.videoUrl && (
            <>
              <video
                ref={videoRef}
                className={`w-full object-cover ${!isVideoReady ? 'hidden' : ''}`}
                loop
                muted
                playsInline
                preload="none"
              />

              {isBuffering && isVideoReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <CachedImage
          src={fallbackUrl}
          alt="Cover"
          className="w-full object-cover"
          style={{ display: 'block', width: '100%' }}
          skeletonShape="square"
          skeletonSize="lg"
        />
      )}
    </div>
  );
};

export default AnimatedCover;
