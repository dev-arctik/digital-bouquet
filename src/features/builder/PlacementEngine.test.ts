import { generatePlacements } from './PlacementEngine';
import { CANVAS_WIDTH, CANVAS_HEIGHT, FLOWER_SIZE } from '../../data/flowers';
import type { CartFlower } from '../../types';

describe('generatePlacements', () => {
  it('returns correct number of placed flowers', () => {
    const cart: CartFlower[] = [
      { type: 'rose', count: 2 },
      { type: 'tulip', count: 1 },
    ];
    const placed = generatePlacements(cart);
    expect(placed).toHaveLength(3);
  });

  it('keeps all flowers within canvas bounds', () => {
    const cart: CartFlower[] = [
      { type: 'sunflower', count: 3 },
      { type: 'lily', count: 3 },
    ];
    const placed = generatePlacements(cart);

    for (const flower of placed) {
      expect(flower.x).toBeGreaterThanOrEqual(0);
      expect(flower.y).toBeGreaterThanOrEqual(0);
      expect(flower.x).toBeLessThanOrEqual(CANVAS_WIDTH - FLOWER_SIZE);
      expect(flower.y).toBeLessThanOrEqual(CANVAS_HEIGHT - FLOWER_SIZE);
    }
  });

  it('assigns sequential z-indices starting at 1', () => {
    const cart: CartFlower[] = [
      { type: 'daisy', count: 2 },
      { type: 'peony', count: 2 },
    ];
    const placed = generatePlacements(cart);
    const zIndices = placed.map((f) => f.zIndex);
    expect(zIndices).toEqual([1, 2, 3, 4]);
  });

  it('generates unique IDs for each flower', () => {
    const cart: CartFlower[] = [{ type: 'orchid', count: 4 }];
    const placed = generatePlacements(cart);
    const ids = placed.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('preserves flower types from the cart', () => {
    const cart: CartFlower[] = [
      { type: 'carnation', count: 1 },
      { type: 'dahlia', count: 2 },
    ];
    const placed = generatePlacements(cart);
    const types = placed.map((f) => f.type);
    expect(types).toEqual(['carnation', 'dahlia', 'dahlia']);
  });

  it('returns empty array for empty cart', () => {
    expect(generatePlacements([])).toEqual([]);
  });

  it('handles max bouquet (6 flowers)', () => {
    const cart: CartFlower[] = [{ type: 'rose', count: 6 }];
    const placed = generatePlacements(cart);
    expect(placed).toHaveLength(6);
    // All should still be in bounds
    for (const flower of placed) {
      expect(flower.x).toBeGreaterThanOrEqual(0);
      expect(flower.x).toBeLessThanOrEqual(CANVAS_WIDTH - FLOWER_SIZE);
    }
  });

  it('handles single flower', () => {
    const cart: CartFlower[] = [{ type: 'tulip', count: 1 }];
    const placed = generatePlacements(cart);
    expect(placed).toHaveLength(1);
    expect(placed[0]!.type).toBe('tulip');
    expect(placed[0]!.zIndex).toBe(1);
  });
});
