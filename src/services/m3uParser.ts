import { IPTVChannel } from '../types';

const M3U_CACHE_KEY = 'iptv_m3u_raw_cache';
const M3U_CACHE_TTL = 10 * 60 * 1000; // 10 min

export async function fetchAndParseM3U(url: string): Promise<IPTVChannel[]> {
  try {
    // Try raw text cache first for instant parse
    const cached = getM3UCache();
    if (cached) {
      // Parse cached text immediately, refresh in background
      const channels = parseM3U(cached);
      fetch(url).then(r => r.ok ? r.text() : null).then(t => { if (t) setM3UCache(t); }).catch(() => {});
      return channels;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch playlist: ${response.status}`);
    }
    
    const text = await response.text();
    setM3UCache(text);
    return parseM3U(text);
  } catch (error) {
    console.error('Error fetching M3U:', error);
    return getDemoChannels();
  }
}

function getM3UCache(): string | null {
  try {
    const raw = localStorage.getItem(M3U_CACHE_KEY);
    if (!raw) return null;
    const { text, ts } = JSON.parse(raw);
    if (Date.now() - ts > M3U_CACHE_TTL) return null;
    return text;
  } catch { return null; }
}

function setM3UCache(text: string): void {
  try {
    localStorage.setItem(M3U_CACHE_KEY, JSON.stringify({ text, ts: Date.now() }));
  } catch {}
}

function parseM3U(content: string): IPTVChannel[] {
  const channels: IPTVChannel[] = [];
  
  // Optimized parsing: avoid split for huge files, use indexOf-based scanning
  let pos = 0;
  const len = content.length;
  let currentChannel: Partial<IPTVChannel> | null = null;

  // Pre-compiled regex patterns for speed
  const logoRe = /tvg-logo="([^"]*)"/;
  const groupRe = /group-title="([^"]*)"/;
  const langRe = /tvg-language="([^"]*)"/;
  const countryRe = /tvg-country="([^"]*)"/;
  const nameRe = /,([^,]+)$/;

  while (pos < len) {
    // Find end of line
    let eol = content.indexOf('\n', pos);
    if (eol === -1) eol = len;
    
    // Trim line
    let start = pos;
    let end = eol;
    while (start < end && (content[start] === ' ' || content[start] === '\r' || content[start] === '\t')) start++;
    while (end > start && (content[end - 1] === ' ' || content[end - 1] === '\r' || content[end - 1] === '\t')) end--;
    
    const line = content.substring(start, end);
    pos = eol + 1;

    if (line.length === 0) continue;

    if (line.charCodeAt(0) === 35) { // '#'
      if (line.startsWith('#EXTINF:')) {
        currentChannel = {
          logo: logoRe.exec(line)?.[1] || '',
          group: groupRe.exec(line)?.[1] || 'General',
          language: langRe.exec(line)?.[1] || '',
          country: countryRe.exec(line)?.[1] || '',
          name: nameRe.exec(line)?.[1]?.trim() || 'Unknown Channel',
        };
      }
    } else if (currentChannel?.name) {
      channels.push({
        id: generateId(currentChannel.name, line),
        name: currentChannel.name,
        url: line,
        logo: currentChannel.logo,
        group: currentChannel.group,
        language: currentChannel.language,
        country: currentChannel.country,
      });
      currentChannel = null;
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
