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
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load HLS stream
  useEffect(() => {
    if (!channel || !videoRef.current) return;

    const video = videoRef.current;
    setIsLoading(true);
    setError(null);

    // Cleanup previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Pause video before loading new stream
    video.pause();

    const loadStream = () => {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          maxLoadingDelay: 4,
          maxBufferLength: 60,
          maxMaxBufferLength: 120,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 3,
          levelLoadingTimeOut: 10000,
          fragLoadingTimeOut: 20000,
          startLevel: -1, // Start with highest quality
          autoStartLoad: true,
          capLevelToPlayerSize: false, // Don't limit quality based on player size
          maxBufferSize: 60 * 1000 * 1000, // 60MB buffer
          maxBufferHole: 0.5,
        });

        hlsRef.current = hls;
        hls.loadSource(channel.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          setRetryCount(0);
          // Force highest quality level
          if (hls.levels.length > 0) {
            hls.currentLevel = hls.levels.length - 1; // Select highest quality
          }
          // Only attempt to play if not already playing
          if (video.paused) {
            video.play().catch((error) => {
              if (error.name !== 'AbortError') {
                console.error('Play error:', error);
              }
            });
          }
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            if (retryCount < 3) {
              setRetryCount((prev) => prev + 1);
              hls.destroy();
              setTimeout(loadStream, 2000);
            } else {
              setError('Stream unavailable. Try another channel.');
              setIsLoading(false);
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = channel.url;
        video.addEventListener('loadedmetadata', () => {
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

    // Timeout for loading
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setError('Stream took too long to load');
    }, 15000);

    return () => {
      clearTimeout(timeout);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      // Pause video when unmounting
      video.pause();
    };
  }, [channel]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

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

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
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

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    setIsLoading(true);
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    // Trigger reload by updating the channel (parent will handle)
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
        className="w-full h-full object-cover"
        playsInline
        preload="auto"
        crossOrigin="anonymous"
      />

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative mb-6">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <Tv className="absolute inset-0 m-auto w-6 h-6 text-white" />
          </div>
          <p className="text-white font-semibold">Loading stream...</p>
          <p className="text-muted-foreground text-sm mt-2">{channel.name}</p>
        </div>
      )}

      {/* Error Overlay - Removed */}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 text-white hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Back</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <h2 className="font-bold text-white">{channel.name}</h2>
              {channel.group && (
                <p className="text-sm text-white/60">{channel.group}</p>
              )}
            </div>
            <button
              onClick={onToggleFavorite}
              className="p-3 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? 'text-accent fill-accent' : 'text-white'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onPrevious}
              className="p-3 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 transition-colors"
            >
              <SkipBack className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-gradient-premium flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 text-white" fill="white" />
              ) : (
                <Play className="w-7 h-7 text-white ml-1" fill="white" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-3 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 transition-colors"
            >
              <SkipForward className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center justify-between">
            {/* Volume */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
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

export default VideoPlayer;
