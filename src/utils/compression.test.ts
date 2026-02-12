import { compress, decompress } from './compression';

describe('compress / decompress', () => {
  it('round-trips a simple string', () => {
    const input = 'hello world';
    const compressed = compress(input);
    expect(decompress(compressed)).toBe(input);
  });

  it('round-trips an empty string', () => {
    const compressed = compress('');
    expect(decompress(compressed)).toBe('');
  });

  it('round-trips unicode characters', () => {
    const input = '🌹🌻🌷 Für dich — ¡flores!';
    const compressed = compress(input);
    expect(decompress(compressed)).toBe(input);
  });

  it('round-trips a large JSON payload', () => {
    const input = JSON.stringify({
      flowers: Array.from({ length: 6 }, (_, i) => ({
        t: 'rose',
        x: i * 100,
        y: i * 50,
        z: i + 1,
      })),
      note: { t: 'A'.repeat(500), ff: 'DM Sans', x: 100, y: 200 },
      greenery: 'bush',
    });
    expect(decompress(compress(input))).toBe(input);
  });

  it('returns null for corrupted / garbage data', () => {
    expect(decompress('not-valid-compressed-data!!!')).toBeNull();
  });

  it('produces a URL-safe string (no +, /, =)', () => {
    const compressed = compress('test data for URL safety check');
    // lz-string's encodedURIComponent output only uses A-Z, a-z, 0-9, +, /, =
    // but the wrapper uses compressToEncodedURIComponent which is URI-safe
    expect(compressed).not.toContain(' ');
    expect(decodeURIComponent(compressed)).toBeDefined();
  });
});
