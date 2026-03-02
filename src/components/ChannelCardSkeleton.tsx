import React from 'react';

const ChannelCardSkeleton: React.FC = () => (
  <div className="channel-card p-3 animate-pulse">
    <div className="aspect-square rounded-xl bg-muted/60 mb-2.5" />
    <div className="space-y-2">
      <div className="h-4 bg-muted/60 rounded-lg w-3/4" />
      <div className="flex gap-1">
        <div className="h-4 bg-muted/40 rounded-full w-14" />
        <div className="h-4 bg-muted/40 rounded-full w-10" />
      </div>
    </div>
  </div>
);

export const ChannelGridSkeleton: React.FC<{ count?: number }> = ({ count = 24 }) => (
  <div className="grid gap-4 sm:gap-6 grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-8">
    {Array.from({ length: count }).map((_, i) => (
      <ChannelCardSkeleton key={i} />
    ))}
  </div>
);

export default ChannelCardSkeleton;
