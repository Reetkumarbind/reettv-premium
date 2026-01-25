import React, { useState, useMemo } from 'react';
import { Search, Heart, Grid3X3, List, RefreshCw, Tv, Filter, X } from 'lucide-react';
import { IPTVChannel } from '../types';
import ChannelCard from './ChannelCard';

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

  // Get unique groups
  const groups = useMemo(() => {
    const uniqueGroups = new Set(channels.map(c => c.group || 'General'));
    return ['all', ...Array.from(uniqueGroups).sort()];
  }, [channels]);

  // Filter and sort channels
  const filteredChannels = useMemo(() => {
    let result = channels;

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

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
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
          <div className="flex items-center gap-3 pb-4 overflow-x-auto scrollbar-hide">
            {/* Group Filter */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {groups.slice(0, 8).map((group) => (
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {showFavoritesOnly ? 'Favorites' : selectedGroup === 'all' ? 'All Channels' : selectedGroup}
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredChannels.length} channel{filteredChannels.length !== 1 ? 's' : ''} available
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
          <div className={`grid gap-4 sm:gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {filteredChannels.map((channel, index) => (
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
        )}
      </main>
    </div>
  );
};

export default ChannelGallery;
