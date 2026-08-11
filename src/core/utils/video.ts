import type { VideoProvider } from '../types';
import { normalizeHttpUrl } from './url';

/**
 * Result of parsing a video URL.
 */
export interface ParsedVideoUrl {
  /** The original URL */
  url: string;
  /** Embed-ready URL (iframe src) */
  embedUrl: string;
  /** Detected provider */
  provider: VideoProvider;
}

/**
 * Parse a video URL and extract embed information.
 *
 * Supported providers:
 * - YouTube (youtube.com, youtu.be, youtube-nocookie.com)
 * - Vimeo (vimeo.com)
 * - Dailymotion (dailymotion.com, dai.ly)
 * - Loom (loom.com)
 * - Wistia (wistia.com, wi.st)
 * - Direct video files (.mp4, .webm, .ogg, .mov)
 *
 * @returns Parsed result or `null` if the URL is not a recognized video.
 */
export function parseVideoUrl(url: string): ParsedVideoUrl | null {
  if (!url || !url.trim()) return null;

  const trimmed = url.trim();
  const parsedUrl = normalizeHttpUrl(trimmed);
  if (!parsedUrl) return null;
  const host = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
  const parts = parsedUrl.pathname.split('/').filter(Boolean);

  const result = (provider: VideoProvider, embedUrl: string): ParsedVideoUrl => ({
    url: parsedUrl.toString(),
    embedUrl,
    provider,
  });

  // ---- YouTube ----
  if (host === 'youtu.be' || host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    const candidate = host === 'youtu.be'
      ? parts[0]
      : parsedUrl.searchParams.get('v') ??
        (['embed', 'shorts', 'v'].includes(parts[0] ?? '') ? parts[1] : undefined);
    if (candidate && /^[a-zA-Z0-9_-]{11}$/.test(candidate)) {
      return result('youtube', `https://www.youtube-nocookie.com/embed/${candidate}`);
    }
  }

  // ---- Vimeo ----
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const candidate = parts[0] === 'video' ? parts[1] : parts[0];
    if (candidate && /^\d+$/.test(candidate)) {
      return result('vimeo', `https://player.vimeo.com/video/${candidate}`);
    }
  }

  // ---- Dailymotion ----
  if (host === 'dailymotion.com' || host === 'dai.ly') {
    const rawCandidate = host === 'dai.ly'
      ? parts[0]
      : parts[0] === 'video'
        ? parts[1]
        : parts[0] === 'embed' && parts[1] === 'video'
          ? parts[2]
          : undefined;
    const candidate = rawCandidate?.split('_', 1)[0];
    if (candidate && /^[a-zA-Z0-9]+$/.test(candidate)) {
      return result('dailymotion', `https://www.dailymotion.com/embed/video/${candidate}`);
    }
  }

  // ---- Loom ----
  if (host === 'loom.com' && ['share', 'embed'].includes(parts[0] ?? '')) {
    const candidate = parts[1];
    if (candidate && /^[a-zA-Z0-9]+$/.test(candidate)) {
      return result('loom', `https://www.loom.com/embed/${candidate}`);
    }
  }

  // ---- Wistia ----
  if (host.endsWith('.wistia.com') || host === 'wistia.com' || host === 'wi.st') {
    const candidate = parts[0] === 'medias'
      ? parts[1]
      : parts[0] === 'embed' && parts[1] === 'iframe'
        ? parts[2]
        : undefined;
    if (candidate && /^[a-zA-Z0-9]+$/.test(candidate)) {
      return result('wistia', `https://fast.wistia.net/embed/iframe/${candidate}`);
    }
  }

  // ---- Direct video file ----
  if (/\.(mp4|webm|ogg|mov|m4v)$/i.test(parsedUrl.pathname)) {
    return result('direct', parsedUrl.toString());
  }

  return null;
}

/**
 * List of supported provider names (for display purposes).
 */
export const VIDEO_PROVIDERS: Record<VideoProvider, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  dailymotion: 'Dailymotion',
  loom: 'Loom',
  wistia: 'Wistia',
  direct: 'Video',
};
