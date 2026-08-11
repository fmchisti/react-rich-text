const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const BARE_DOMAIN_RE = /^(?:localhost|(?:[a-z0-9-]+\.)+[a-z]{2,})(?::\d+)?(?:[/?#].*)?$/i;

/** Normalize a user-entered link and reject executable/unknown schemes. */
export function normalizeLinkUrl(input: string): string | null {
  const value = input.trim();
  if (!value || /[\u0000-\u001f\u007f]/.test(value)) return null;

  if (
    value.startsWith('/') ||
    value.startsWith('./') ||
    value.startsWith('../') ||
    value.startsWith('#') ||
    value.startsWith('?')
  ) {
    return value.startsWith('//') ? null : value;
  }

  if (BARE_DOMAIN_RE.test(value)) {
    try {
      return new URL(`https://${value}`).toString();
    } catch {
      return null;
    }
  }

  try {
    const parsed = new URL(value);
    return SAFE_LINK_PROTOCOLS.has(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

/** Accept only absolute HTTP(S) URLs for externally loaded media. */
export function normalizeHttpUrl(input: string): URL | null {
  try {
    const parsed = new URL(input.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed : null;
  } catch {
    return null;
  }
}
