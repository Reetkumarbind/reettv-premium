import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Heart,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  Tv,
  Keyboard,
  Settings,
} from 'lucide-react';
import { IPTVChannel } from '../types';

interface VideoPlayerProps {
  channel: IPTVChannel | null;
  nextChannelName?: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onMinimize: () => void;
  onExit: () => void;
  onShowKeyboard?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  nextChannelName,
  isFavorite,
  onToggleFavorite,
  onNext,
  onPrevious,
  onMinimize,
  onExit,
  onShowKeyboard,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const overlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load HLS stream - only reload when channel URL changes
  useEffect(() => {
    if (!channel || !videoRef.current) return;

    const video = videoRef.current;
    
    setIsLoading(true);
    setShowLoadingOverlay(true);
    setError(null);
    setRetryCount(0); // Reset retry count when switching channels

    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }

    if (overlayTimeoutRef.current) {
      clearTimeout(overlayTimeoutRef.current);
      overlayTimeoutRef.current = null;
    }

    // Cleanup previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Pause video before loading new stream
    video.pause();

    let isComponentMounted = true;
    let retries = 0;
    const maxRetries = 2;

    const loadStream = () => {
      if (!isComponentMounted) return;
      
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          startLevel: -1,
          autoStartLoad: true,
          capLevelToPlayerSize: true,
          maxLoadingDelay: 4,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          backBufferLength: 15,
          maxBufferSize: 30 * 1000 * 1000,
          maxBufferHole: 0.5,
          manifestLoadingTimeOut: 8000,
          manifestLoadingMaxRetry: 3,
          manifestLoadingRetryDelay: 500,
          levelLoadingTimeOut: 8000,
          levelLoadingMaxRetry: 3,
          fragLoadingTimeOut: 15000,
          fragLoadingMaxRetry: 4,
          fragLoadingRetryDelay: 500,
          abrEwmaDefaultEstimate: 500000,
          abrBandWidthFactor: 0.95,
          abrBandWidthUpFactor: 0.7,
          progressive: true,
        });

        hlsRef.current = hls;
        hls.loadSource(channel.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!isComponentMounted) return;
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
          }
          setIsLoading(false);
          setRetryCount(0);
          hls.currentLevel = -1;
          if (video.paused) {
            video.play().catch((error) => {
              if (error.name !== 'AbortError') {
                console.error('Play error:', error);
              }
            });
          }
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!isComponentMounted) return;
          console.error('HLS Error:', data);
          if (data.fatal) {
            if (retries < maxRetries) {
              retries++;
              setRetryCount(retries);
              if (hlsRef.current === hls) {
                hls.destroy();
                hlsRef.current = null;
              }
              setTimeout(loadStream, 2000);
            } else {
              if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
                loadTimeoutRef.current = null;
              }
              setShowLoadingOverlay(false);
              setError('Stream unavailable or offline. Try another channel.');
              setIsLoading(false);
              if (hlsRef.current === hls) {
                hls.destroy();
                hlsRef.current = null;
              }
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = channel.url;
        video.addEventListener('loadedmetadata', () => {
          if (!isComponentMounted) return;
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
          }
          setIsLoading(false);
          if (video.paused) {
            video.play().catch((error) => {
              if (error.name !== 'AbortError') {
                console.error('Play error:', error);
              }
            });
          }
        });
      } else {
        setError('HLS not supported in this browser');
        setIsLoading(false);
      }
    };

    loadStream();

    overlayTimeoutRef.current = setTimeout(() => {
      if (isComponentMounted) {
        setShowLoadingOverlay(false);
      }
    }, 8000);

    loadTimeoutRef.current = setTimeout(() => {
      if (isComponentMounted) {
        setShowLoadingOverlay(false);
        setIsLoading(false);
        setError('Stream is taking too long. Please try another channel.');
      }
    }, 30000);

    return () => {
      isComponentMounted = false;
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
        overlayTimeoutRef.current = null;
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.pause();
    };
  }, [channel]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => {
      // Only show loading if we're really stuck buffering for more than 1s
      setTimeout(() => {
        if (video.paused === false && video.readyState < 3) {
          setShowLoadingOverlay(true);
        }
      }, 1000);
    };
    const handleCanPlay = () => {
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
        overlayTimeoutRef.current = null;
      }
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      setShowLoadingOverlay(false);
      setIsLoading(false);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // Controls visibility
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    (document as any).addEventListener('webkitfullscreenchange', handleFullscreenChange);
    (document as any).addEventListener('mozfullscreenchange', handleFullscreenChange);
    (document as any).addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      (document as any).removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      (document as any).removeEventListener('mozfullscreenchange', handleFullscreenChange);
      (document as any).removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
      }
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Play error:', error);
          }
        });
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    const elem = containerRef.current;
    
    // Check if already in fullscreen
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    if (!isCurrentlyFullscreen) {
      // Enter fullscreen
      const requestFullscreen = 
        elem.requestFullscreen ||
        (elem as any).webkitRequestFullscreen ||
        (elem as any).mozRequestFullScreen ||
        (elem as any).msRequestFullscreen;

      if (requestFullscreen) {
        requestFullscreen.call(elem).catch((err: Error) => {
          console.error('Fullscreen request failed:', err);
        });
        setIsFullscreen(true);
      }
    } else {
      // Exit fullscreen
      const exitFullscreen = 
        document.exitFullscreen ||
        (document as any).webkitExitFullscreen ||
        (document as any).mozCancelFullScreen ||
        (document as any).msExitFullscreen;

      if (exitFullscreen) {
        exitFullscreen.call(document).catch((err: Error) => {
          console.error('Exit fullscreen failed:', err);
        });
        setIsFullscreen(false);
      }
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    setIsLoading(true);
    setShowLoadingOverlay(true);
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    // Re-trigger the channel loading effect
    if (channel) {
      // Force re-render by triggering the channel change
      setIsLoading(true);
    }
  };

  if (!channel) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <p className="text-muted-foreground">No channel selected</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group"
      onMouseMove={showControlsTemporarily}
      onTouchStart={showControlsTemporarily}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover cursor-pointer"
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        onDoubleClick={toggleFullscreen}
      />



      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-40">
          <div className="relative mb-6">
            <AlertCircle className="w-16 h-16 text-destructive" />
          </div>
          <p className="text-white font-semibold text-center max-w-xs">{error}</p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleRetry}
              className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
            <button
              onClick={onExit}
              className="px-6 py-2 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-2 xs:p-3 md:p-4 flex items-center justify-between">
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-2 xs:px-3 md:px-4 py-1.5 xs:py-2 md:py-2 rounded-lg xs:rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 text-white hover:bg-black/60 transition-colors text-xs xs:text-sm md:text-base min-h-[44px] xs:min-h-[40px] md:min-h-auto"
          >
            <ArrowLeft className="w-3 xs:w-4 h-3 xs:h-4" />
            <span className="hidden sm:inline font-medium">Back</span>
          </button>

          <div className="flex items-center gap-2 xs:gap-3">
            <div className="text-right hidden sm:block text-xs md:text-base">
              <h2 className="font-bold text-white line-clamp-1">{channel.name}</h2>
              {channel.group && (
                <p className="text-xs md:text-sm text-white/60 line-clamp-1">{channel.group}</p>
              )}
            </div>
            <button
              onClick={onToggleFavorite}
              className="p-2 xs:p-3 md:p-3 rounded-lg xs:rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center xs:min-h-[auto] xs:min-w-[auto]"
            >
              <Heart
                className={`w-4 xs:w-5 h-4 xs:h-5 ${
                  isFavorite ? 'text-accent fill-accent' : 'text-white'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 xs:h-28 md:h-40 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-2 xs:p-3 md:p-4 space-y-2 xs:space-y-3 md:space-y-4 pb-safe">
          {/* Main Controls */}
          <div className="flex items-center justify-center gap-2 xs:gap-3 md:gap-4">
            <button
              onClick={onPrevious}
              className="p-2 xs:p-3 md:p-3 rounded-lg xs:rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center xs:min-h-[auto] xs:min-w-[auto]"
            >
              <SkipBack className="w-4 xs:w-5 h-4 xs:h-5 text-white" />
            </button>

            <button
              onClick={togglePlay}
              className="w-12 xs:w-14 md:w-16 h-12 xs:h-14 md:h-16 rounded-full bg-gradient-premium flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 xs:w-6 md:w-7 h-5 xs:h-6 md:h-7 text-white" fill="white" />
              ) : (
                <Play className="w-5 xs:w-6 md:w-7 h-5 xs:h-6 md:h-7 text-white ml-0.5 xs:ml-1" fill="white" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-2 xs:p-3 md:p-3 rounded-lg xs:rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center xs:min-h-[auto] xs:min-w-[auto]"
            >
              <SkipForward className="w-4 xs:w-5 h-4 xs:h-5 text-white" />
            </button>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center justify-between gap-2 xs:gap-3">
            {/* Volume */}
            <div className="flex items-center gap-1 xs:gap-3 flex-shrink-0">
              <button
                onClick={toggleMute}
                className="p-1.5 xs:p-2 rounded-lg hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center xs:min-h-[auto] xs:min-w-[auto]"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 xs:w-5 h-4 xs:h-5 text-white" />
                ) : (
                  <Volume2 className="w-4 xs:w-5 h-4 xs:h-5 text-white" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-24 hidden sm:block"
              />
            </div>

            {/* Next Channel Preview */}
            {nextChannelName && (
              <div className="hidden md:flex items-center gap-2 text-sm text-white/60">
                <span>Next:</span>
                <span className="font-medium text-white">{nextChannelName}</span>
              </div>
            )}

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {onShowKeyboard && (
                <button
                  onClick={onShowKeyboard}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors hidden sm:block"
                  title="Keyboard shortcuts"
                >
                  <Keyboard className="w-5 h-5 text-white" />
                </button>
              )}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5 text-white" />
                ) : (
                  <Maximize className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(VideoPlayer, (prevProps, nextProps) => {
  // Custom comparison to avoid re-renders when props haven't meaningfully changed
  return (
    prevProps.channel?.id === nextProps.channel?.id &&
    prevProps.nextChannelName === nextProps.nextChannelName &&
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.onToggleFavorite === nextProps.onToggleFavorite &&
    prevProps.onNext === nextProps.onNext &&
    prevProps.onPrevious === nextProps.onPrevious &&
    prevProps.onMinimize === nextProps.onMinimize &&
    prevProps.onExit === nextProps.onExit &&
    prevProps.onShowKeyboard === nextProps.onShowKeyboard
  );
});


