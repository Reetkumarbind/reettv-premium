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
      className="channel-card p-4 cursor-pointer animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Logo Container */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted mb-4 group">
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
          <Tv className="w-12 h-12 text-muted-foreground" />
        </div>
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-gradient-premium flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Live Badge */}
        <div className="absolute top-3 left-3">
          <span className="badge-live">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-black/60 hover:scale-110 active:scale-95"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'text-accent fill-accent' : 'text-white'
            }`}
          />
        </button>
      </div>

      {/* Channel Info */}
      <div className="space-y-2">
        <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
          {channel.name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {channel.group && (
            <span className="badge-category">{channel.group}</span>
          )}
          {channel.language && (
            <span className="badge-category">{channel.language}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelCard;
