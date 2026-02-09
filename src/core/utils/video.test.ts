import { describe, it, expect } from 'vitest';
import { parseVideoUrl } from './video';

describe('parseVideoUrl', () => {
  // ---- YouTube ----
  it('parses standard YouTube URL', () => {
    const result = parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result).not.toBeNull();
    expect(result!.provider).toBe('youtube');
    expect(result!.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  it('parses YouTube short URL', () => {
    const result = parseVideoUrl('https://youtu.be/dQw4w9WgXcQ');
    expect(result).not.toBeNull();
    expect(result!.provider).toBe('youtube');
    expect(result!.embedUrl).toContain('dQw4w9WgXcQ');
  });

  it('parses YouTube embed URL', () => {
    const result = parseVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
    expect(result).not.toBeNull();
    expect(result!.provider).toBe('youtube');
  });

  it('parses YouTube shorts URL', () => {
    const result = parseVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ');
    expect(result).not.toBeNull();
    expect(result!.provider).toBe('youtube');
  });

  // ---- Vimeo ----
  it('parses Vimeo URL', () => {
    const result = parseVideoUrl('https://vimeo.com/123456789');
    expect(result).not.toBeNull();
    expect(result!.provider).toBe('vimeo');
    expect(result!.embedUrl).toBe('https://player.vimeo.com/video/123456789');
  });

  it('parses Vimeo player URL', () => {
    const result = parseVideoUrl('https://player.vimeo.com/video/123456789');
    expect(result).not.toBeNull();
    expect(result!.provider).toBe('vimeo');
  });

  // ---- Dailymotion ----
  it('parses Dailymotion URL', () => {
    const result = parseVideoUrl('https://www.dailymotion.com/video/x5e9eog');
    expect(result).not.toBeNull();
    expect(result!.provider).toBe('dailymotion');
    expect(result!.embedUrl).toBe('https://www.dailymotion.com/embed/video/x5e9eog');
  });

  it('parses dai.ly short URL', () => {
    const result = parseVideoUrl('https://dai.ly/x5e9eog');
    expect(result).not.toBeNull();
    expect(result!.provider).toBe('dailymotion');
  });

  // ---- Loom ----
  it('parses Loom share URL', () => {
    const result = parseVideoUrl('https://www.loom.com/share/abc123def456');
    expect(result).not.toBeNull();
    expect(result!.provider).toBe('loom');
    expect(result!.embedUrl).toBe('https://www.loom.com/embed/abc123def456');
  });

  // ---- Wistia ----
  it('parses Wistia URL', () => {
    const result = parseVideoUrl('https://home.wistia.com/medias/abc123');
    expect(result).not.toBeNull();
    expect(result!.provider).toBe('wistia');
    expect(result!.embedUrl).toBe('https://fast.wistia.net/embed/iframe/abc123');
  });

  // ---- Direct video files ----
  it('parses .mp4 URL', () => {
    const result = parseVideoUrl('https://example.com/video.mp4');
    expect(result).not.toBeNull();
    expect(result!.provider).toBe('direct');
    expect(result!.embedUrl).toBe('https://example.com/video.mp4');
  });

  it('parses .webm URL', () => {
    const result = parseVideoUrl('https://example.com/video.webm');
    expect(result).not.toBeNull();
    expect(result!.provider).toBe('direct');
  });

  it('parses .ogg URL', () => {
    const result = parseVideoUrl('https://example.com/video.ogg');
    expect(result).not.toBeNull();
    expect(result!.provider).toBe('direct');
  });

  // ---- Invalid ----
  it('returns null for empty input', () => {
    expect(parseVideoUrl('')).toBeNull();
  });

  it('returns null for random URL', () => {
    expect(parseVideoUrl('https://example.com/page')).toBeNull();
  });

  it('returns null for image URL', () => {
    expect(parseVideoUrl('https://example.com/photo.jpg')).toBeNull();
  });
});
