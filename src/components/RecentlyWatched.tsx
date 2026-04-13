import React, { memo, useMemo } from 'react';
import { Clock, Play } from 'lucide-react';
import { IPTVChannel, WatchHistoryItem } from '../types';

interface RecentlyWatchedProps {
  history: WatchHistoryItem[];
  channels: IPTVChannel[];
  onSelect: (channel: IPTVChannel) => void;
}

const RecentlyWatched: React.FC<RecentlyWatchedProps> = memo(({ history, channels, onSelect }) => {
  const recentChannels = useMemo(() => {
    const channelMap = new Map(channels.map(c => [c.id, c]));
    return history
      .slice(0, 10)
      .map(h => channelMap.get(h.channelId))
      .filter((c): c is IPTVChannel => !!c);
  }, [history, channels]);

  if (recentChannels.length === 0) return null;

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Recently Watched</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {recentChannels.map((channel) => {
          const historyItem = history.find(h => h.channelId === channel.id);
          return (
            <button
              key={channel.id}
              onClick={() => onSelect(channel)}
              className="flex-shrink-0 group relative w-28 sm:w-32 rounded-xl overflow-hidden bg-muted/20 border border-border/10 hover:border-primary/30 transition-all hover:scale-[1.03] active:scale-95"
            >
              <div className="aspect-video bg-muted/30 flex items-center justify-center relative">
                {channel.logo ? (
                  <img src={channel.logo} alt="" className="w-full h-full object-contain p-2" loading="lazy" />
                ) : (
                  <span className="text-lg font-bold text-muted-foreground/30">{channel.name[0]}</span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-foreground truncate">{channel.name}</p>
                {historyItem && (
                  <p className="text-[10px] text-muted-foreground">{timeAgo(historyItem.timestamp)}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

RecentlyWatched.displayName = 'RecentlyWatched';
export default RecentlyWatched;
