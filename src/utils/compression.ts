// Thin wrapper around lz-string for URL-safe compression.
// Used by encoder.ts (bouquet -> URL param) and decoder.ts (URL param -> bouquet).

import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';

// Compress a string into a URL-safe encoded string
export function compress(data: string): string {
  return compressToEncodedURIComponent(data);
}

// Decompress a URL-safe encoded string back to the original.
// Returns null if decompression fails (corrupted data).
export function decompress(data: string): string | null {
  return decompressFromEncodedURIComponent(data);
}
