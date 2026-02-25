import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search, Heart, Grid3X3, List, RefreshCw, Tv, Filter, X, ArrowUp, Loader2, Mic, MicOff } from 'lucide-react';
import { IPTVChannel } from '../types';
import ChannelCard from './ChannelCard';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChannelGalleryProps {
  channels: IPTVChannel[];
  favorites: Set<string>;
  onSelect: (index: number) => void;
  onToggleFavorite: (id: string) => void;
  onRefresh: () => void;
}

type SortOption = 'name' | 'group' | 'recent';
type ViewMode = 'grid' | 'list';

const ChannelGallery: React.FC<ChannelGalleryProps> = ({
  channels,
  favorites,
  onSelect,
  onToggleFavorite,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);
  const [isListening, setIsListening] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const supportsVoice = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) as boolean;

  const toggleVoiceSearch = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!supportsVoice) return;

    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as SpeechRecognitionResultList)
        .map((r: any) => r[0].transcript)
        .join('');
      setSearchQuery(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, supportsVoice]);

  // Get unique groups with channel counts and show top 10
  const groups = useMemo(() => {
    const groupCounts = new Map<string, number>();
    
    // Count channels per group
    channels.forEach(c => {
      const group = c.group || 'General';
      groupCounts.set(group, (groupCounts.get(group) || 0) + 1);
    });
    
    // Sort by count and get top 10
    const sortedGroups = Array.from(groupCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([group]) => group);
    
    return ['all', ...sortedGroups];
  }, [channels]);

  // Filter and sort channels
  const filteredChannels = useMemo(() => {
    // Only show Hindi, Bhojpuri, and English channels
    const allowedLanguages = ['hindi', 'bhojpuri', 'english'];
    let result = channels.filter(c => {
      const lang = c.language?.toLowerCase() || '';
      return allowedLanguages.some(al => lang.includes(al));
    });

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.group?.toLowerCase().includes(query) ||
        c.language?.toLowerCase().includes(query)
      );
    }

    // Group filter
    if (selectedGroup !== 'all') {
      result = result.filter(c => c.group === selectedGroup);
    }

    // Favorites filter
    if (showFavoritesOnly) {
      result = result.filter(c => favorites.has(c.id));
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'group':
          return (a.group || '').localeCompare(b.group || '');
        default:
          return 0;
      }
    });

    return result;
  }, [channels, searchQuery, selectedGroup, showFavoritesOnly, sortBy, favorites]);

  // Scroll detection for "scroll to top" button
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollTop = scrollContainerRef.current.scrollTop;
        setShowScrollTop(scrollTop > 500);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Infinite scroll - load more channels
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        // Load more when user scrolls to 80% of the page
        if (scrollTop + clientHeight >= scrollHeight * 0.8) {
          setDisplayCount(prev => Math.min(prev + 20, filteredChannels.length));
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [filteredChannels.length]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(20);
  }, [searchQuery, selectedGroup, showFavoritesOnly, sortBy]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleChannelSelect = (channel: IPTVChannel) => {
    const index = channels.findIndex(c => c.id === channel.id);
    if (index !== -1) {
      onSelect(index);
    }
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const displayedChannels = filteredChannels.slice(0, displayCount);

  return (
    <div ref={scrollContainerRef} className="h-screen w-full bg-background safe-top safe-bottom overflow-y-auto scrollbar-thin">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-premium">
                <Tv className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black tracking-tight">REET TV</h1>
                <p className="text-xs text-muted-foreground font-medium">Premium Streams</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 ${supportsVoice ? 'pr-20' : 'pr-10'} py-2.5 rounded-xl bg-muted/50 border ${isListening ? 'border-accent ring-2 ring-accent/30' : 'border-border/50'} text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all`}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 rounded-lg hover:bg-muted transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                  {supportsVoice && (
                    <button
                      onClick={toggleVoiceSearch}
                      className={`p-1.5 rounded-lg transition-all ${
                        isListening
                          ? 'bg-accent/20 text-accent animate-pulse'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                      title={isListening ? 'Stop listening' : 'Voice search'}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="btn-icon"
                title="Refresh channels"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`btn-icon ${showFavoritesOnly ? 'bg-accent/20 border-accent/30' : ''}`}
                title="Toggle favorites"
              >
                <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'text-accent fill-accent' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-3 pb-4 overflow-x-auto scrollbar-thin">
            {/* Group Filter - Top 10 Categories */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {groups.map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    selectedGroup === group
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {group === 'all' ? 'All Channels' : group}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {showFavoritesOnly ? 'Favorites' : selectedGroup === 'all' ? 'All Channels' : selectedGroup}
            </h2>
            <p className="text-sm text-muted-foreground">
              Showing {displayedChannels.length} of {filteredChannels.length} channel{filteredChannels.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="name">Sort by Name</option>
              <option value="group">Sort by Group</option>
            </select>
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-muted/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
              <Tv className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No channels found</h3>
            <p className="text-muted-foreground max-w-sm">
              {showFavoritesOnly
                ? "You haven't added any favorites yet. Start exploring and heart your favorite channels!"
                : "Try adjusting your search or filter to find what you're looking for."}
            </p>
            {(searchQuery || selectedGroup !== 'all' || showFavoritesOnly) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGroup('all');
                  setShowFavoritesOnly(false);
                }}
                className="btn-primary mt-6"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* Channel Grid */
          <>
            <div className={`grid gap-4 sm:gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
                : 'grid-cols-1'
            }`}>
              {displayedChannels.map((channel, index) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  isFavorite={favorites.has(channel.id)}
                  onSelect={() => handleChannelSelect(channel)}
                  onToggleFavorite={() => onToggleFavorite(channel.id)}
                  index={index}
                />
              ))}
            </div>
            
            {/* Load More Indicator */}
            {displayedChannels.length < filteredChannels.length && (
              <div className="flex flex-col justify-center items-center py-8 gap-4">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Loading more channels...
                  </p>
                </div>
                <button
                  onClick={() => setDisplayCount(filteredChannels.length)}
                  className="btn-secondary text-sm"
                >
                  View All ({filteredChannels.length} channels)
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-premium shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 animate-fade-in"
          title="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
};

export default ChannelGallery;
