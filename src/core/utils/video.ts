import type { VideoProvider } from '../types';

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

  // ---- YouTube ----
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return {
      url: trimmed,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`,
      provider: 'youtube',
    };
  }

  // ---- Vimeo ----
  const vimeoMatch = trimmed.match(
    /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/
  );
  if (vimeoMatch) {
    return {
      url: trimmed,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      provider: 'vimeo',
    };
  }

  // ---- Dailymotion ----
  const dmMatch = trimmed.match(
    /(?:dailymotion\.com\/(?:video|embed\/video)\/|dai\.ly\/)([a-zA-Z0-9]+)/
  );
  if (dmMatch) {
    return {
      url: trimmed,
      embedUrl: `https://www.dailymotion.com/embed/video/${dmMatch[1]}`,
      provider: 'dailymotion',
    };
  }

  // ---- Loom ----
  const loomMatch = trimmed.match(
    /loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/
  );
  if (loomMatch) {
    return {
      url: trimmed,
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
      provider: 'loom',
    };
  }

  // ---- Wistia ----
  const wistiaMatch = trimmed.match(
    /(?:wistia\.com\/medias|wi\.st\/medias|wistia\.com\/embed\/iframe)\/([a-zA-Z0-9]+)/
  );
  if (wistiaMatch) {
    return {
      url: trimmed,
      embedUrl: `https://fast.wistia.net/embed/iframe/${wistiaMatch[1]}`,
      provider: 'wistia',
    };
  }

  // ---- Direct video file ----
  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(trimmed)) {
    return {
      url: trimmed,
      embedUrl: trimmed,
      provider: 'direct',
    };
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
