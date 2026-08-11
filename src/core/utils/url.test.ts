import { describe, expect, it } from 'vitest';
import { normalizeHttpUrl, normalizeLinkUrl } from './url';

describe('URL normalization', () => {
  it('normalizes bare domains to HTTPS', () => {
    expect(normalizeLinkUrl('example.com')).toBe('https://example.com/');
  });

  it('allows safe absolute and relative links', () => {
    expect(normalizeLinkUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
    expect(normalizeLinkUrl('/docs/getting-started')).toBe('/docs/getting-started');
  });

  it('rejects executable and protocol-relative links', () => {
    expect(normalizeLinkUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeLinkUrl('//evil.example/path')).toBeNull();
  });

  it('restricts media URLs to HTTP(S)', () => {
    expect(normalizeHttpUrl('https://example.com/video.mp4')?.protocol).toBe('https:');
    expect(normalizeHttpUrl('javascript:video.mp4')).toBeNull();
  });
});
