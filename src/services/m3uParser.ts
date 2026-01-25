import { IPTVChannel } from '../types';

export async function fetchAndParseM3U(url: string): Promise<IPTVChannel[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch playlist: ${response.status}`);
    }
    
    const text = await response.text();
    return parseM3U(text);
  } catch (error) {
    console.error('Error fetching M3U:', error);
    // Return demo channels if fetch fails
    return getDemoChannels();
  }
}

function parseM3U(content: string): IPTVChannel[] {
  const lines = content.split('\n');
  const channels: IPTVChannel[] = [];
  
  let currentChannel: Partial<IPTVChannel> = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#EXTINF:')) {
      // Parse channel info
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);
      const languageMatch = line.match(/tvg-language="([^"]*)"/);
      const countryMatch = line.match(/tvg-country="([^"]*)"/);
      const nameMatch = line.match(/,(.+)$/);
      
      currentChannel = {
        logo: logoMatch?.[1] || '',
        group: groupMatch?.[1] || 'General',
        language: languageMatch?.[1] || '',
        country: countryMatch?.[1] || '',
        name: nameMatch?.[1]?.trim() || 'Unknown Channel',
      };
    } else if (line && !line.startsWith('#') && currentChannel.name) {
      // This is the URL line
      channels.push({
        id: generateId(currentChannel.name, line),
        name: currentChannel.name,
        url: line,
        logo: currentChannel.logo,
        group: currentChannel.group,
        language: currentChannel.language,
        country: currentChannel.country,
      });
      currentChannel = {};
    }
  }
  
  return channels.length > 0 ? channels : getDemoChannels();
}

function generateId(name: string, url: string): string {
  const combined = `${name}-${url}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function getDemoChannels(): IPTVChannel[] {
  return [
    {
      id: 'demo1',
      name: 'Big Buck Bunny',
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/220px-Big_buck_bunny_poster_big.jpg',
      group: 'Demo',
      language: 'English',
    },
    {
      id: 'demo2',
      name: 'Sintel',
      url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Sintel.jpg/220px-Sintel.jpg',
      group: 'Demo',
      language: 'English',
    },
    {
      id: 'demo3',
      name: 'Tears of Steel',
      url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Tos-poster.png/220px-Tos-poster.png',
      group: 'Demo',
      language: 'English',
    },
  ];
}
