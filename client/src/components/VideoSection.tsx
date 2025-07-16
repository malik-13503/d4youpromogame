import { useState, useRef, useEffect } from "react";
import { Play, PlayCircle } from "lucide-react";
import videoFile from "@assets/Michael Patrick - PART 1 D4UP Scratch & Win (1)_1751280936821.mp4";

interface VideoSectionProps {
  onVideoComplete: () => void;
}

export default function VideoSection({ onVideoComplete }: VideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handlePlay = () => {
    setIsLoading(true);
    setIsPlaying(true);
    
    // Start playing the video
    if (videoRef.current) {
      videoRef.current.play();
    }
    setIsLoading(false);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const progressPercent = (currentTime / duration) * 100;
      setProgress(progressPercent);
      
      // Enable form when video is 80% complete
      if (progressPercent >= 80 && !videoCompleted) {
        onVideoComplete();
        setVideoCompleted(true);
      }
    }
  };

  const handleVideoEnd = () => {
    if (!videoCompleted) {
      onVideoComplete();
      setVideoCompleted(true);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleVideoEnd);
      
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleVideoEnd);
      };
    }
  }, []);

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Video Header */}
          <div className="bg-gradient-to-r from-[#F76D46] to-[#2C5CDC] text-white text-center py-4 md:py-6 rounded-t-lg shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-3 px-4">
              <PlayCircle className="animate-pulse flex-shrink-0" size={24} />
              <h2 className="text-base md:text-2xl font-bold text-center md:text-left" style={{ fontFamily: 'Montserrat, sans-serif' }}>CLICK BELOW TO WATCH THE VIDEO</h2>
            </div>
          </div>
          
          {/* Video Player */}
          <div className="relative bg-gray-900 rounded-b-lg shadow-2xl overflow-hidden">
            <div className="aspect-video relative">
              {/* Local video with optimized loading */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                preload="metadata"
                playsInline
                controls
                muted={false}
                style={{ display: isPlaying ? 'block' : 'none' }}
                onLoadStart={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
              >
                <source src={videoFile} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Video preview with play button */}
              {!isPlaying && (
                <div className="w-full h-full relative">
                  {/* Video thumbnail (first frame) */}
                  <video
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                  >
                    <source src={videoFile} type="video/mp4" />
                  </video>
                  
                  {/* Dark overlay for better button visibility */}
                  <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                  
                  {/* Play Button */}
                  <button 
                    onClick={handlePlay}
                    disabled={isLoading}
                    className="absolute inset-0 flex items-center justify-center z-10 bg-transparent hover:bg-black hover:bg-opacity-20 transition-all duration-300"
                  >
                    <div className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-6 transform hover:scale-110 transition-all duration-300 shadow-2xl">
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F76D46]"></div>
                      ) : (
                        <Play className="text-4xl text-[#F76D46] ml-1" size={48} />
                      )}
                    </div>
                  </button>
                </div>
              )}
              
              {/* Video Progress Indicator */}
              <div 
                className="absolute bottom-0 left-0 h-1 bg-[hsl(16,100%,64%)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
              

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}