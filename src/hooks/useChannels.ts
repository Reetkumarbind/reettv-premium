import { useQuery } from '@tanstack/react-query';
import { fetchAndParseM3U } from '../services/m3uParser';
import { ChannelHealthService } from '../services/channelHealthService';
import { IPTVChannel } from '../types';

const M3U_URL = 'https://iptv-org.github.io/iptv/countries/in.m3u';

async function fetchChannels(): Promise<IPTVChannel[]> {
  const data = await fetchAndParseM3U(M3U_URL);
  const valid = data.filter(ch => ch.url && ch.name && ch.id);
  ChannelHealthService.cacheChannels(valid);
  return ChannelHealthService.filterHealthyChannels(valid);
}

function getCachedChannels(): IPTVChannel[] | undefined {
  const cached = ChannelHealthService.getCachedChannels();
  if (cached && cached.length > 0) {
    return ChannelHealthService.filterHealthyChannels(cached);
  }
  return undefined;
}

export function useChannels() {
  return useQuery<IPTVChannel[]>({
    queryKey: ['channels', 'in'],
    queryFn: fetchChannels,
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 30 * 60 * 1000, // 30 min
    initialData: getCachedChannels,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
