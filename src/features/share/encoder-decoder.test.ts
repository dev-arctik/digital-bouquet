import { encodeBouquet } from './encoder';
import { decodeBouquet } from './decoder';
import { compress } from '../../utils/compression';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../data/flowers';
import type { Bouquet } from '../../types';

// Helper — builds a valid Bouquet for testing
function makeBouquet(overrides?: Partial<Bouquet>): Bouquet {
  return {
    id: crypto.randomUUID(),
    flowers: [
      { id: crypto.randomUUID(), type: 'rose', x: 100, y: 200, zIndex: 1 },
      { id: crypto.randomUUID(), type: 'tulip', x: 300, y: 150, zIndex: 2 },
    ],
    note: {
      text: 'Happy birthday!',
      fontFamily: 'DM Sans',
      x: 300,
      y: 480,
    },
    greenery: 'bush',
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ── Round-trip tests ──────────────────────────────────────────────────

describe('encodeBouquet → decodeBouquet round-trip', () => {
  it('preserves flower types, positions, and z-order', () => {
    const original = makeBouquet();
    const encoded = encodeBouquet(original);
    const decoded = decodeBouquet(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded!.flowers).toHaveLength(original.flowers.length);

    for (let i = 0; i < original.flowers.length; i++) {
      expect(decoded!.flowers[i]!.type).toBe(original.flowers[i]!.type);
      expect(decoded!.flowers[i]!.x).toBe(original.flowers[i]!.x);
      expect(decoded!.flowers[i]!.y).toBe(original.flowers[i]!.y);
      expect(decoded!.flowers[i]!.zIndex).toBe(original.flowers[i]!.zIndex);
    }
  });

  it('preserves note text, font, and position', () => {
    const original = makeBouquet();
    const decoded = decodeBouquet(encodeBouquet(original));

    expect(decoded!.note).not.toBeNull();
    expect(decoded!.note!.text).toBe('Happy birthday!');
    expect(decoded!.note!.fontFamily).toBe('DM Sans');
    expect(decoded!.note!.x).toBe(300);
    expect(decoded!.note!.y).toBe(480);
  });

  it('preserves greenery type', () => {
    const original = makeBouquet({ greenery: 'monstera' });
    const decoded = decodeBouquet(encodeBouquet(original));
    expect(decoded!.greenery).toBe('monstera');
  });

  it('handles null note', () => {
    const original = makeBouquet({ note: null });
    const decoded = decodeBouquet(encodeBouquet(original));
    expect(decoded!.note).toBeNull();
  });

  it('regenerates IDs (not reused from original)', () => {
    const original = makeBouquet();
    const decoded = decodeBouquet(encodeBouquet(original));

    // Bouquet ID should be fresh
    expect(decoded!.id).not.toBe(original.id);
    // Flower IDs should all be fresh
    for (let i = 0; i < original.flowers.length; i++) {
      expect(decoded!.flowers[i]!.id).not.toBe(original.flowers[i]!.id);
    }
  });

  it('sets canvas dimensions to the standard constants', () => {
    const decoded = decodeBouquet(encodeBouquet(makeBouquet()));
    expect(decoded!.canvasWidth).toBe(CANVAS_WIDTH);
    expect(decoded!.canvasHeight).toBe(CANVAS_HEIGHT);
  });

  it('round-trips a max bouquet (6 flowers + 50-word note)', () => {
    const maxBouquet = makeBouquet({
      flowers: [
        { id: crypto.randomUUID(), type: 'rose', x: 10, y: 20, zIndex: 1 },
        { id: crypto.randomUUID(), type: 'tulip', x: 110, y: 120, zIndex: 2 },
        { id: crypto.randomUUID(), type: 'sunflower', x: 210, y: 220, zIndex: 3 },
        { id: crypto.randomUUID(), type: 'lily', x: 310, y: 320, zIndex: 4 },
        { id: crypto.randomUUID(), type: 'daisy', x: 410, y: 420, zIndex: 5 },
        { id: crypto.randomUUID(), type: 'peony', x: 510, y: 500, zIndex: 6 },
      ],
      note: {
        text: Array.from({ length: 50 }, () => 'word').join(' '),
        fontFamily: 'DM Sans',
        x: 200,
        y: 400,
      },
    });

    const decoded = decodeBouquet(encodeBouquet(maxBouquet));
    expect(decoded).not.toBeNull();
    expect(decoded!.flowers).toHaveLength(6);
    expect(decoded!.note!.text.split(/\s+/).filter(Boolean)).toHaveLength(50);
  });
});

// ── Decoder validation tests ──────────────────────────────────────────

describe('decodeBouquet validation', () => {
  // Helper — encode raw JSON (bypass encodeBouquet to test malformed data)
  function encodeRaw(data: unknown): string {
    return compress(JSON.stringify(data));
  }

  it('rejects empty string', () => {
    expect(decodeBouquet('')).toBeNull();
  });

  it('rejects garbage data', () => {
    expect(decodeBouquet('aslkdjf98234jsd')).toBeNull();
  });

  it('rejects non-object payload', () => {
    expect(decodeBouquet(compress('"just a string"'))).toBeNull();
  });

  it('rejects 0 flowers', () => {
    expect(decodeBouquet(encodeRaw({ f: [], n: null, g: 'none' }))).toBeNull();
  });

  it('rejects more than 6 flowers', () => {
    const flowers = Array.from({ length: 7 }, (_, i) => ({
      t: 'rose', x: 100, y: 100, z: i + 1,
    }));
    expect(decodeBouquet(encodeRaw({ f: flowers, n: null, g: 'none' }))).toBeNull();
  });

  it('rejects invalid flower type', () => {
    expect(decodeBouquet(encodeRaw({
      f: [{ t: 'cactus', x: 100, y: 100, z: 1 }],
      n: null,
      g: 'none',
    }))).toBeNull();
  });

  it('rejects out-of-bounds x coordinate', () => {
    expect(decodeBouquet(encodeRaw({
      f: [{ t: 'rose', x: -10, y: 100, z: 1 }],
      n: null,
      g: 'none',
    }))).toBeNull();
  });

  it('rejects out-of-bounds y coordinate', () => {
    expect(decodeBouquet(encodeRaw({
      f: [{ t: 'rose', x: 100, y: CANVAS_HEIGHT + 1, z: 1 }],
      n: null,
      g: 'none',
    }))).toBeNull();
  });

  it('rejects duplicate z-indices', () => {
    expect(decodeBouquet(encodeRaw({
      f: [
        { t: 'rose', x: 100, y: 100, z: 1 },
        { t: 'tulip', x: 200, y: 200, z: 1 },
      ],
      n: null,
      g: 'none',
    }))).toBeNull();
  });

  it('rejects invalid greenery type', () => {
    expect(decodeBouquet(encodeRaw({
      f: [{ t: 'rose', x: 100, y: 100, z: 1 }],
      n: null,
      g: 'cactus',
    }))).toBeNull();
  });

  it('rejects note with too many words', () => {
    expect(decodeBouquet(encodeRaw({
      f: [{ t: 'rose', x: 100, y: 100, z: 1 }],
      n: {
        t: Array.from({ length: 51 }, () => 'word').join(' '),
        ff: 'DM Sans',
        x: 100,
        y: 100,
      },
      g: 'none',
    }))).toBeNull();
  });

  it('rejects invalid note font', () => {
    expect(decodeBouquet(encodeRaw({
      f: [{ t: 'rose', x: 100, y: 100, z: 1 }],
      n: { t: 'hello', ff: 'Comic Sans', x: 100, y: 100 },
      g: 'none',
    }))).toBeNull();
  });

  it('strips HTML from note text', () => {
    const decoded = decodeBouquet(encodeRaw({
      f: [{ t: 'rose', x: 100, y: 100, z: 1 }],
      n: { t: '<b>bold</b> <script>alert("xss")</script>text', ff: 'DM Sans', x: 100, y: 100 },
      g: 'none',
    }));
    expect(decoded).not.toBeNull();
    expect(decoded!.note!.text).toBe('bold alert("xss")text');
    expect(decoded!.note!.text).not.toContain('<');
  });

  it('accepts a valid minimal bouquet', () => {
    const decoded = decodeBouquet(encodeRaw({
      f: [{ t: 'daisy', x: 400, y: 300, z: 1 }],
      n: null,
      g: 'sprigs',
    }));
    expect(decoded).not.toBeNull();
    expect(decoded!.flowers).toHaveLength(1);
    expect(decoded!.flowers[0]!.type).toBe('daisy');
    expect(decoded!.greenery).toBe('sprigs');
  });
});
