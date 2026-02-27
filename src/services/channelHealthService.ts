import { IPTVChannel } from '../types';

const CACHE_KEY = 'iptv_channels_cache_v1';
const HEALTH_KEY = 'iptv_channel_health_v2';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

interface ChannelCache {
  channels: IPTVChannel[];
  timestamp: number;
}

interface HealthRecord {
  [channelId: string]: {
    healthy: boolean;
    checkedAt: number;
  };
}

export class ChannelHealthService {
  // Cache management
  static getCachedChannels(): IPTVChannel[] | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const cache: ChannelCache = JSON.parse(raw);
      if (Date.now() - cache.timestamp > CACHE_TTL) return null;
      return cache.channels;
    } catch {
      return null;
    }
  }

  static cacheChannels(channels: IPTVChannel[]): void {
    try {
      const cache: ChannelCache = { channels, timestamp: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.error('Failed to cache channels:', e);
    }
  }

  // Health tracking
  static getHealthRecords(): HealthRecord {
    try {
      const raw = localStorage.getItem(HEALTH_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  static saveHealthRecords(records: HealthRecord): void {
    try {
      localStorage.setItem(HEALTH_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save health records:', e);
    }
  }

  static filterHealthyChannels(channels: IPTVChannel[]): IPTVChannel[] {
    const records = this.getHealthRecords();
    const healthCheckTTL = 2 * 60 * 60 * 1000; // 2 hours

    return channels.filter(ch => {
      const record = records[ch.id];
      // If never checked or check is stale, assume healthy (will be checked in background)
      if (!record || Date.now() - record.checkedAt > healthCheckTTL) return true;
      return record.healthy;
    });
  }

  // Background health check using HLS probe
  static async checkChannelsBatch(
    channels: IPTVChannel[],
    onUpdate: (healthyIds: Set<string>) => void,
    batchSize = 10
  ): Promise<void> {
    const records = this.getHealthRecords();
    const healthCheckTTL = 2 * 60 * 60 * 1000;
    const healthyIds = new Set<string>();

    // Identify channels that need checking
    const toCheck = channels.filter(ch => {
      const record = records[ch.id];
      if (record && Date.now() - record.checkedAt < healthCheckTTL) {
        if (record.healthy) healthyIds.add(ch.id);
        return false; // already checked recently
      }
      return true;
    });

    // Initially report known-healthy channels
    onUpdate(healthyIds);

    // Process in batches
    for (let i = 0; i < toCheck.length; i += batchSize) {
      const batch = toCheck.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(ch => this.probeChannel(ch))
      );

      results.forEach((result, idx) => {
        const ch = batch[idx];
        const isHealthy = result.status === 'fulfilled' && result.value;
        records[ch.id] = { healthy: isHealthy, checkedAt: Date.now() };
        if (isHealthy) healthyIds.add(ch.id);
      });

      this.saveHealthRecords(records);
      onUpdate(new Set(healthyIds));

      // Small delay between batches to avoid flooding
      if (i + batchSize < toCheck.length) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
  }

  private static async probeChannel(channel: IPTVChannel): Promise<boolean> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(channel.url, {
        method: 'GET',
        signal: controller.signal,
        headers: { Range: 'bytes=0-1024' },
      });
      clearTimeout(timeout);

      if (!response.ok) return false;

      // For m3u8/HLS streams, check if response contains valid HLS content
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('mpegurl') || channel.url.includes('.m3u8')) {
        const text = await response.text();
        return text.includes('#EXTM3U') || text.includes('#EXT-X');
      }

      // For direct streams, a 200/206 is good enough
      return response.status === 200 || response.status === 206;
    } catch {
      clearTimeout(timeout);
      return false;
    }
  }
}
