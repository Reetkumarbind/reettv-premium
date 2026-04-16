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
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
        {recentChannels.map((channel) => {
          const historyItem = history.find(h => h.channelId === channel.id);
          const hue = [...channel.name].reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0) % 360;
          return (
            <button
              key={channel.id}
              onClick={() => onSelect(channel)}
              className="flex-shrink-0 group flex flex-col items-center transition-all hover:-translate-y-1 active:scale-95"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-border/20 group-hover:border-primary/40 transition-colors duration-300">
                <div className="absolute inset-0 rounded-full bg-card" />
                {channel.logo ? (
                  <img src={channel.logo} alt="" className="relative w-full h-full object-contain p-2.5" loading="lazy" />
                ) : (
                  <div
                    className="absolute inset-0 rounded-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, hsl(${Math.abs(hue)} 50% 20%), hsl(${(Math.abs(hue) + 40) % 360} 40% 15%))` }}
                  >
                    <span className="text-base font-black text-foreground/50 select-none">{channel.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                </div>
              </div>
              <div className="mt-1.5 text-center w-16 sm:w-20">
                <p className="text-[10px] sm:text-xs font-semibold text-foreground truncate">{channel.name}</p>
                {historyItem && (
                  <p className="text-[9px] text-muted-foreground">{timeAgo(historyItem.timestamp)}</p>
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
