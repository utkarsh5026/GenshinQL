import { useEffect, useState, useRef } from "react";
import { AnimationMedia } from "@/graphql/types";
import { Volume2, VolumeX } from "lucide-react";

interface AnimatedCoverProps {
  animation?: AnimationMedia;
  fallbackUrl?: string;
  className?: string;
}

export const AnimatedCover: React.FC<AnimatedCoverProps> = ({
  animation,
  fallbackUrl,
  className = "",
}) => {
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (animation?.videoUrl && videoRef.current) {
      const video = videoRef.current;

      video.load();

      video.addEventListener("canplaythrough", () => {
        setShowVideo(true);
        video.play();
      });
    }
  }, [animation]);

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className={`w-full overflow-hidden relative ${className}`}>
      {animation ? (
        <>
          {!showVideo && animation.imageUrl && (
            <img
              src={animation.imageUrl}
              alt="Animation Preview"
              className="w-full h-full object-cover"
            />
          )}
          {animation.videoUrl && (
            <>
              <video
                ref={videoRef}
                className={`w-full object-cover ${!showVideo ? "hidden" : ""}`}
                loop
                muted
                playsInline
              >
                <source src={animation.videoUrl} type="video/mp4" />
              </video>
              {showVideo && (
                <button
                  onClick={handleMuteToggle}
                  className="absolute bottom-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="h-6 w-6 text-white" />
                  ) : (
                    <Volume2 className="h-6 w-6 text-white" />
                  )}
                </button>
              )}
            </>
          )}
        </>
      ) : (
        <img
          src={fallbackUrl}
          alt="Cover"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default AnimatedCover;
