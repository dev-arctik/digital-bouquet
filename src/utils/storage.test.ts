import { hasStorageRoom } from './storage';

// Mock localStorage for node environment
function createMockStorage(entries: Record<string, string>): Storage {
  const store = { ...entries };
  return {
    get length() {
      return Object.keys(store).length;
    },
    key(index: number) {
      return Object.keys(store)[index] ?? null;
    },
    getItem(key: string) {
      return store[key] ?? null;
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      for (const key of Object.keys(store)) delete store[key];
    },
  };
}

describe('hasStorageRoom', () => {
  beforeEach(() => {
    // Provide a clean localStorage mock before each test
    Object.defineProperty(globalThis, 'localStorage', {
      value: createMockStorage({}),
      writable: true,
      configurable: true,
    });
  });

  it('returns true when storage is empty', () => {
    expect(hasStorageRoom()).toBe(true);
  });

  it('returns true for a small write on empty storage', () => {
    expect(hasStorageRoom(1000)).toBe(true);
  });

  it('returns false when storage is nearly full', () => {
    // Fill storage to ~2.4M chars → (2.4M + 50K) * 2 = ~4.9M, barely fits
    // Fill to ~2.5M → (2.5M + 50K) * 2 = ~5.1M, should fail
    const bigValue = 'x'.repeat(2_500_000);
    Object.defineProperty(globalThis, 'localStorage', {
      value: createMockStorage({ data: bigValue }),
      writable: true,
      configurable: true,
    });
    expect(hasStorageRoom()).toBe(false);
  });

  it('returns true when storage has room for the estimated bytes', () => {
    const smallValue = 'x'.repeat(1000);
    Object.defineProperty(globalThis, 'localStorage', {
      value: createMockStorage({ data: smallValue }),
      writable: true,
      configurable: true,
    });
    expect(hasStorageRoom(10_000)).toBe(true);
  });

  it('returns false when localStorage throws (e.g. private browsing)', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      get() {
        throw new Error('SecurityError');
      },
      configurable: true,
    });
    expect(hasStorageRoom()).toBe(false);
  });
});
