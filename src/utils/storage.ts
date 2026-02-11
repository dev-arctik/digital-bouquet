// localStorage helpers for quota checking before saves.

// Rough estimate of remaining localStorage space (~5MB limit in most browsers).
// Returns false if a write of the estimated size would likely fail.
export function hasStorageRoom(estimatedBytes: number = 50_000): boolean {
  try {
    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        used += key.length + (localStorage.getItem(key)?.length ?? 0);
      }
    }
    // Most browsers cap at ~5MB (5_242_880 chars). Leave a safety buffer.
    return (used + estimatedBytes) * 2 < 5_000_000;
  } catch {
    return false;
  }
}
