import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense, useRef } from 'react';
import { IPTVChannel, UserPreferences } from '../types';
import { StorageService } from '../services/storageService';
import { ChannelHealthService } from '../services/channelHealthService';
import { KeyboardService } from '../services/keyboardService';
import { useSEO } from '../hooks/useSEO';
import { useChannels } from '../hooks/useChannels';
import ChannelGallery from '../components/ChannelGallery';
import AppSidebar, { SidebarView } from '../components/AppSidebar';
import BottomNavBar from '../components/BottomNavBar';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { Loader2, AlertCircle, Tv, RefreshCw } from 'lucide-react';

const VideoPlayer = lazy(() => import('../components/VideoPlayer'));
const SettingsPanel = lazy(() => import('../components/SettingsPanel'));
const KeyboardShortcuts = lazy(() => import('../components/KeyboardShortcuts'));
const MiniPlayer = lazy(() => import('../components/MiniPlayer'));

type ViewMode = 'gallery' | 'player' | 'mini';

const VIEW_ORDER: SidebarView[] = ['home', 'trending', 'favorites', 'categories'];

const Index: React.FC = () => {
  const { data: channels = [], isLoading, error: queryError, refetch } = useChannels();
  const [healthyIds, setHealthyIds] = useState<Set<string> | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set(StorageService.getFavorites()));
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [sidebarView, setSidebarView] = useState<SidebarView>('home');
  const [transitionDir, setTransitionDir] = useState<'left' | 'right' | null>(null);

  const [preferences, setPreferences] = useState<UserPreferences>(StorageService.getUserPreferences());
  const [showSettings, setShowSettings] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [keyboardService] = useState(() => new KeyboardService());
  const [miniPlayerPosition, setMiniPlayerPosition] = useState({ x: 20, y: 20 });
  const healthCheckRunning = useRef(false);
  const healthCheckAbortRef = useRef<AbortController | null>(null);

  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Connection failed') : null;

  // Sort sortedChannels with healthy ones first when health data arrives
  const sortedChannels = useMemo(() => {
    if (healthyIds === null) return channels;
    return [...channels].sort((a, b) => {
      const aH = healthyIds.has(a.id) ? 0 : 1;
      const bH = healthyIds.has(b.id) ? 0 : 1;
      return aH - bH;
    });
  }, [channels, healthyIds]);

  // Swipe to navigate between views
  const navigateView = useCallback((direction: 'left' | 'right') => {
    if (viewMode !== 'gallery') return;
    const idx = VIEW_ORDER.indexOf(sidebarView);
    const nextIdx = direction === 'left' ? idx + 1 : idx - 1;
    if (nextIdx >= 0 && nextIdx < VIEW_ORDER.length) {
      setTransitionDir(direction === 'left' ? 'left' : 'right');
      setSidebarView(VIEW_ORDER[nextIdx]);
      setTimeout(() => setTransitionDir(null), 350);
    }
  }, [sidebarView, viewMode]);

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => navigateView('left'),
    onSwipeRight: () => navigateView('right'),
  });

  // Handle view change with transition
  const handleViewChange = useCallback((view: SidebarView) => {
    const fromIdx = VIEW_ORDER.indexOf(sidebarView);
    const toIdx = VIEW_ORDER.indexOf(view);
    setTransitionDir(toIdx > fromIdx ? 'left' : 'right');
    setSidebarView(view);
    setTimeout(() => setTransitionDir(null), 350);
  }, [sidebarView]);

  // Force dark class on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // SEO Hook
  useSEO({
    title: sidebarView === 'favorites' 
      ? 'My Favorites' 
      : sidebarView === 'categories' 
      ? 'Categories' 
      : sidebarView === 'trending' 
      ? 'Trending' 
      : 'Home',
    description: 'Stream live TV channels, on-demand content, and more with REET TV. Your favorite entertainment anytime, anywhere with our premium IPTV service.',
    keywords: ['IPTV', 'live TV', 'streaming', 'channels', 'on-demand', 'premium content'],
    url: window.location.href,
    type: 'website',
  });

  // Deferred background health checks
  useEffect(() => {
    if (channels.length === 0 || healthCheckRunning.current) return;
    healthCheckRunning.current = true;
    if (healthCheckAbortRef.current) healthCheckAbortRef.current.abort();
    healthCheckAbortRef.current = new AbortController();
    const signal = healthCheckAbortRef.current.signal;

    const run = () => {
      if (signal.aborted) return;
      ChannelHealthService.checkChannelsBatch(
        channels,
        (ids) => { if (!signal.aborted) setHealthyIds(new Set(ids)); },
        5
      ).finally(() => { if (!signal.aborted) healthCheckRunning.current = false; });
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => setTimeout(run, 1000), { timeout: 5000 });
    } else {
      setTimeout(run, 3000);
    }
  }, [channels]);

  const handleRefresh = useCallback(() => {
    localStorage.removeItem('iptv_channel_health_v2');
    healthCheckRunning.current = false;
    refetch();
  }, [refetch]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => { 
    return () => {
      keyboardService.destroy();
      // Cancel health check on unmount
      if (healthCheckAbortRef.current) {
        healthCheckAbortRef.current.abort();
      }
    };
  }, [keyboardService]);
  useEffect(() => { StorageService.saveFavorites(Array.from(favorites)); }, [favorites]);

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
    if (!preferences.keyboardShortcuts) { keyboardService.setEnabled(false); return; }
    keyboardService.setEnabled(true);
    keyboardService.clearShortcuts();

    keyboardService.addShortcut({ key: ' ', description: 'Play/Pause', action: () => {
      if (viewMode === 'player' || viewMode === 'mini') {
        const video = document.querySelector('video');
        if (video) { if (video.paused) video.play().catch(console.error); else video.pause(); }
      }
    }});
    keyboardService.addShortcut({ key: 'ArrowLeft', description: 'Previous Channel', action: () => {
      if (viewMode === 'player' && sortedChannels.length > 0) setCurrentIndex((prev) => (prev - 1 + sortedChannels.length) % sortedChannels.length);
    }});
    keyboardService.addShortcut({ key: 'ArrowRight', description: 'Next Channel', action: () => {
      if (viewMode === 'player' && sortedChannels.length > 0) setCurrentIndex((prev) => (prev + 1) % sortedChannels.length);
    }});
    keyboardService.addShortcut({ key: 'Escape', description: 'Back to Gallery', action: () => setViewMode('gallery') });
    keyboardService.addShortcut({ key: 'h', description: 'Toggle Favorite', action: () => {
      if (currentIndex >= 0 && sortedChannels[currentIndex]) toggleFavorite(sortedChannels[currentIndex].id);
    }});
    keyboardService.addShortcut({ key: 'm', description: 'Toggle Mute', action: () => {
      const video = document.querySelector('video'); if (video) video.muted = !video.muted;
    }});
    keyboardService.addShortcut({ key: 's', description: 'Settings', action: () => setShowSettings(true) });
    keyboardService.addShortcut({ key: '?', description: 'Show Shortcuts', action: () => setShowKeyboardShortcuts(true) });

    return () => keyboardService.clearShortcuts();
  }, [preferences.keyboardShortcuts, viewMode, currentIndex, sortedChannels, keyboardService, toggleFavorite]);

  const handleNext = useCallback(() => { if (sortedChannels.length === 0) return; setCurrentIndex((prev) => (prev + 1) % sortedChannels.length); }, [sortedChannels.length]);
  const handlePrevious = useCallback(() => { if (sortedChannels.length === 0) return; setCurrentIndex((prev) => (prev - 1 + sortedChannels.length) % sortedChannels.length); }, [sortedChannels.length]);

  const handleSelectChannel = useCallback((index: number) => { 
    setCurrentIndex(index); 
    setViewMode('player'); 
  }, []);
  
  const handleMinimizePlayer = useCallback(() => setViewMode('mini'), []);
  const handleMaximizePlayer = useCallback(() => setViewMode('player'), []);
  const handleCloseMiniPlayer = useCallback(() => setViewMode('gallery'), []);
  const handleExitPlayer = useCallback(() => setViewMode('gallery'), []);
  const handleShowKeyboard = useCallback(() => setShowKeyboardShortcuts(true), []);

  const currentChannel = useMemo(() => {
    if (currentIndex >= 0 && currentIndex < sortedChannels.length) {
      return sortedChannels[currentIndex];
    }
    return null;
  }, [currentIndex, sortedChannels]);
  const nextChannelName = useMemo(() => {
    if (sortedChannels.length === 0 || currentIndex < 0) return null;
    return sortedChannels[(currentIndex + 1) % sortedChannels.length].name;
  }, [sortedChannels, currentIndex]);

  // Memoize callbacks for VideoPlayer to prevent re-renders
  const handleToggleFavorite = useCallback(() => {
    if (currentChannel) {
      toggleFavorite(currentChannel.id);
    }
  }, [currentChannel?.id, toggleFavorite]);

  // Transition class for page content
  const transitionClass = transitionDir === 'left'
    ? 'animate-slide-in-left'
    : transitionDir === 'right'
    ? 'animate-slide-in-right'
    : '';

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden p-4 md:p-0">
        <div className="absolute top-1/4 left-1/4 w-48 md:w-64 h-48 md:h-64 bg-primary/5 blur-[100px] rounded-full" />
        <div className="relative flex flex-col items-center gap-4 md:gap-6">
          <div className="relative">
            <Loader2 className="w-10 md:w-14 h-10 md:h-14 text-primary animate-spin-slow" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Tv className="w-4 md:w-5 h-4 md:h-5 text-foreground animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-1 md:space-y-1.5">
            <h2 className="text-lg md:text-xl font-black tracking-wider text-foreground uppercase">REET TV</h2>
            <p className="text-muted-foreground text-xs md:text-sm font-medium uppercase tracking-widest">Loading streams...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 md:p-6 text-center">
        <div className="w-12 md:w-14 h-12 md:h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4 md:mb-6">
          <AlertCircle className="w-6 md:w-7 h-6 md:h-7 text-destructive" />
        </div>
        <h2 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight mb-2">Connection Failed</h2>
        <p className="text-muted-foreground mb-6 max-w-sm text-xs md:text-sm">{error}</p>
        <button 
          onClick={handleRetry} 
          className="px-4 md:px-5 py-2 md:py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-xs md:text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 min-h-[44px] md:min-h-auto justify-center"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-background text-foreground flex">
      {/* Mobile sidebar - hidden for all devices */}
      {/* <AppSidebar
        activeView={sidebarView}
        onViewChange={handleViewChange}
        onOpenSettings={() => setShowSettings(true)}
        onOpenShortcuts={() => setShowKeyboardShortcuts(true)}
        favoritesCount={favorites.size}
      /> */}

      {/* Main content */}
      <div
        className="flex-1 min-w-0 flex flex-col"
        {...swipeHandlers}
      >
        {viewMode === 'gallery' ? (
          <div className={`h-full w-full pb-14 xs:pb-16 md:pb-0 pt-12 xs:pt-0 md:pt-0 ${transitionClass}`} key={sidebarView}>
            <ChannelGallery
              channels={sortedChannels}
              favorites={favorites}
              onSelect={handleSelectChannel}
              onToggleFavorite={toggleFavorite}
              onRefresh={handleRefresh}
              isLoading={isLoading}
              activeView={sidebarView}
            />
          </div>
        ) : viewMode === 'player' ? (
          <div className="h-full w-full flex flex-col relative bg-black animate-fade-in">
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><Loader2 className="w-6 md:w-8 h-6 md:h-8 animate-spin-slow text-primary" /></div>}>
              <VideoPlayer
                channel={currentChannel}
                nextChannelName={nextChannelName || undefined}
                isFavorite={currentChannel ? favorites.has(currentChannel.id) : false}
                onToggleFavorite={handleToggleFavorite}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onMinimize={handleMinimizePlayer}
                onExit={handleExitPlayer}
                onShowKeyboard={handleShowKeyboard}
              />
            </Suspense>
          </div>
        ) : null}
      </div>

      {/* Bottom nav - mobile only, hidden when playing */}
      {viewMode === 'gallery' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
          <BottomNavBar
            activeView={sidebarView}
            onViewChange={handleViewChange}
            onOpenSettings={() => setShowSettings(true)}
            favoritesCount={favorites.size}
          />
        </div>
      )}

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
