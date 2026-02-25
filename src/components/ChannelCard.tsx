import React from 'react';
import { Heart, Play, Tv } from 'lucide-react';
import { IPTVChannel } from '../types';

interface ChannelCardProps {
  channel: IPTVChannel;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  index: number;
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isFavorite,
  onSelect,
  onToggleFavorite,
  index,
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  return (
    <div
      onClick={onSelect}
      className="channel-card p-2.5 cursor-pointer animate-fade-in"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Logo Container */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted mb-2.5 group">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="channel-logo w-full h-full object-cover transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 ${channel.logo ? 'hidden' : ''}`}>
          <Tv className="w-8 h-8 text-muted-foreground" />
        </div>
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-premium flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-4 h-4 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* Live Badge */}
        <div className="absolute top-2 left-2">
          <span className="badge-live text-[10px] px-2 py-0.5">
            <span className="w-1 h-1 rounded-full bg-destructive animate-pulse" />
            LIVE
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm border border-border/20 transition-all duration-300 hover:bg-black/60 hover:scale-110 active:scale-95"
        >
          <Heart
            className={`w-3 h-3 transition-colors ${
              isFavorite ? 'text-accent fill-accent' : 'text-primary-foreground'
            }`}
          />
        </button>
      </div>

      {/* Channel Info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-sm text-foreground truncate">
          {channel.name}
        </h3>
        <div className="flex items-center gap-1 flex-wrap">
          {channel.group && (
            <span className="badge-category text-[10px] px-2 py-0.5">{channel.group}</span>
          )}
          {channel.language && (
            <span className="badge-category text-[10px] px-2 py-0.5">{channel.language}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelCard;
