import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { IPTVChannel, UserPreferences } from '../types';
import { fetchAndParseM3U } from '../services/m3uParser';
import { StorageService } from '../services/storageService';
import { KeyboardService } from '../services/keyboardService';
import ChannelGallery from '../components/ChannelGallery';
import { Loader2, AlertCircle, Tv, RefreshCw } from 'lucide-react';

const VideoPlayer = lazy(() => import('../components/VideoPlayer'));
const SettingsPanel = lazy(() => import('../components/SettingsPanel'));
const KeyboardShortcuts = lazy(() => import('../components/KeyboardShortcuts'));
const MiniPlayer = lazy(() => import('../components/MiniPlayer'));

const M3U_URL = 'https://iptv-org.github.io/iptv/countries/in.m3u';

type ViewMode = 'gallery' | 'player' | 'mini';

const Index: React.FC = () => {
  const [channels, setChannels] = useState<IPTVChannel[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');

  const [preferences, setPreferences] = useState<UserPreferences>(StorageService.getUserPreferences());
  const [showSettings, setShowSettings] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [keyboardService] = useState(() => new KeyboardService());
  const [miniPlayerPosition, setMiniPlayerPosition] = useState({ x: 20, y: 20 });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('Starting to load channels');
        setIsLoading(true);
        setError(null);

        const savedFavorites = StorageService.getFavorites();
        setFavorites(new Set(savedFavorites));

        const data = await fetchAndParseM3U(M3U_URL);
        console.log('Loaded channels:', data.length);
        const validChannels = data.filter(channel =>
          channel.url && channel.name && channel.id
        );
        console.log('Valid channels:', validChannels.length);

        setChannels(validChannels);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading channels:', err);
        setError(err instanceof Error ? err.message : 'Connection failed');
        setIsLoading(false);
      }
    };
    initApp();
  }, [refreshKey]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);



  useEffect(() => {
    return () => {
      keyboardService.destroy();
    };
  }, [keyboardService]);

  useEffect(() => {
    StorageService.saveFavorites(Array.from(favorites));
  }, [favorites]);

  const handlePreferencesChange = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    StorageService.saveUserPreferences(newPreferences);
  };

const toggleFavorite = useCallback((channelId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(channelId)) next.delete(channelId);
      else next.add(channelId);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!preferences.keyboardShortcuts) {
      keyboardService.setEnabled(false);
      return;
    }

    keyboardService.setEnabled(true);
    keyboardService.clearShortcuts();

    keyboardService.addShortcut({
      key: ' ',
      description: 'Play/Pause',
      action: () => {
        if (viewMode === 'player' || viewMode === 'mini') {
          const video = document.querySelector('video');
          if (video) {
            if (video.paused) video.play().catch(console.error);
            else video.pause();
          }
        }
      }
    });

    keyboardService.addShortcut({
      key: 'ArrowLeft',
      description: 'Previous Channel',
      action: () => {
        if (viewMode === 'player' && channels.length > 0) {
          setCurrentIndex((prev) => (prev - 1 + channels.length) % channels.length);
        }
      }
    });

    keyboardService.addShortcut({
      key: 'ArrowRight',
      description: 'Next Channel',
      action: () => {
        if (viewMode === 'player' && channels.length > 0) {
          setCurrentIndex((prev) => (prev + 1) % channels.length);
        }
      }
    });

    keyboardService.addShortcut({
      key: 'Escape',
      description: 'Back to Gallery',
      action: () => setViewMode('gallery')
    });

    keyboardService.addShortcut({
      key: 'h',
      description: 'Toggle Favorite',
      action: () => {
        if (currentIndex >= 0 && channels[currentIndex]) {
          toggleFavorite(channels[currentIndex].id);
        }
      }
    });

    keyboardService.addShortcut({
      key: 'm',
      description: 'Toggle Mute',
      action: () => {
        const video = document.querySelector('video');
        if (video) video.muted = !video.muted;
      }
    });

    keyboardService.addShortcut({
      key: 's',
      description: 'Settings',
      action: () => setShowSettings(true)
    });

    keyboardService.addShortcut({
      key: '?',
      description: 'Show Shortcuts',
      action: () => setShowKeyboardShortcuts(true)
    });

    return () => keyboardService.clearShortcuts();
  }, [preferences.keyboardShortcuts, viewMode, currentIndex, channels, keyboardService, toggleFavorite]);

  const handleNext = useCallback(() => {
    if (channels.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % channels.length);
  }, [channels.length]);

  const handlePrevious = useCallback(() => {
    if (channels.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + channels.length) % channels.length);
  }, [channels.length]);

  const handleSelectChannel = (index: number) => {
    setCurrentIndex(index);
    setViewMode('player');
  };

  const handleMinimizePlayer = () => setViewMode('mini');
  const handleMaximizePlayer = () => setViewMode('player');
  const handleCloseMiniPlayer = () => setViewMode('gallery');

  const currentChannel = useMemo(() =>
    currentIndex >= 0 ? channels[currentIndex] : null
  , [channels, currentIndex]);

  const nextChannelName = useMemo(() => {
    if (channels.length === 0 || currentIndex < 0) return null;
    const nextIndex = (currentIndex + 1) % channels.length;
    return channels[nextIndex].name;
  }, [channels, currentIndex]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 blur-[100px] animate-pulse rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 blur-[100px] animate-pulse rounded-full" />

        <div className="relative flex flex-col items-center gap-8">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-primary animate-spin" strokeWidth={1} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Tv className="w-6 h-6 text-foreground animate-pulse" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-widest text-foreground uppercase animate-slide-up">
              REET TV CHANNEL
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-primary/50" />
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
                Premium Streams
              </p>
              <div className="h-px w-8 bg-primary/50" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 sm:p-8 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mb-6 sm:mb-8">
          <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-destructive" />
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground uppercase tracking-tight mb-2">
          Connection Failed
        </h2>
        <p className="text-muted-foreground mb-8 max-w-sm text-sm">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-background text-foreground">
      {viewMode === 'gallery' ? (
        <ChannelGallery
          channels={channels}
          favorites={favorites}
          onSelect={handleSelectChannel}
          onToggleFavorite={toggleFavorite}
          onRefresh={handleRefresh}
        />
      ) : viewMode === 'player' ? (
        <div className="h-full w-full flex flex-col relative bg-black">
          <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <VideoPlayer
              channel={currentChannel}
              nextChannelName={nextChannelName || undefined}
              isFavorite={currentChannel ? favorites.has(currentChannel.id) : false}
              onToggleFavorite={currentChannel ? () => toggleFavorite(currentChannel.id) : () => {}}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onMinimize={handleMinimizePlayer}
              onExit={() => setViewMode('gallery')}
              onShowKeyboard={() => setShowKeyboardShortcuts(true)}
            />
          </Suspense>
        </div>
      ) : null}

      <Suspense fallback={null}>
        <MiniPlayer
          channel={currentChannel}
          isVisible={viewMode === 'mini'}
          onClose={handleCloseMiniPlayer}
          onMaximize={handleMaximizePlayer}
          position={miniPlayerPosition}
          onPositionChange={setMiniPlayerPosition}
        />
      </Suspense>

      <Suspense fallback={null}>
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          preferences={preferences}
          onPreferencesChange={handlePreferencesChange}
        />
      </Suspense>

      <Suspense fallback={null}>
        <KeyboardShortcuts
          isOpen={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
          shortcuts={keyboardService.getShortcuts()}
        />
      </Suspense>
    </div>
  );
};

export default Index;
