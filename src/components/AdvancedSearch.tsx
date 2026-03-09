import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUIStore } from '@/store/uiStore';
import { Search, Filter, X } from 'lucide-react';

interface SearchFilters {
  category?: string;
  language?: string;
  country?: string;
}

export const AdvancedSearch = () => {
  const { showSearchAdvanced, setShowSearchAdvanced, searchQuery, setSearchQuery } = useUIStore();
  const [filters, setFilters] = useState<SearchFilters>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setRecentSearches((prev) => [searchQuery, ...prev.filter((s) => s !== searchQuery)].slice(0, 10));
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <Dialog open={showSearchAdvanced} onOpenChange={setShowSearchAdvanced}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
          <DialogDescription>
            Find your favorite channels with advanced filters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Main search */}
          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Channel name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="news">News</option>
                <option value="sports">Sports</option>
                <option value="movies">Movies</option>
                <option value="entertainment">Entertainment</option>
                <option value="music">Music</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <select
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                value={filters.language || ''}
                onChange={(e) => handleFilterChange('language', e.target.value)}
              >
                <option value="">All Languages</option>
                <option value="hindi">Hindi</option>
                <option value="english">English</option>
                <option value="tamil">Tamil</option>
                <option value="telugu">Telugu</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Country</label>
              <select
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                value={filters.country || ''}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              >
                <option value="">All Countries</option>
                <option value="in">India</option>
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
              </select>
            </div>
          </div>

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Recent Searches</label>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => setSearchQuery(search)}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSearch} className="flex-1">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={Object.keys(filters).length === 0}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
