export interface IPTVChannel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
  language?: string;
  country?: string;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  autoPlay: boolean;
  keyboardShortcuts: boolean;
  defaultQuality: 'auto' | '1080p' | '720p' | '480p';
  volume: number;
}

export interface WatchHistoryItem {
  channelId: string;
  channelName: string;
  timestamp: number;
  duration: number;
  logo?: string;
}

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
}

export interface StreamHealth {
  channelId: string;
  isHealthy: boolean;
  lastChecked: number;
  errorCount: number;
}
