// PlacementEngine — generates random canvas positions for cart flowers.
// Pure function with no React or Redux dependencies.

import type { CartFlower, PlacedFlower } from '../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, FLOWER_SIZE } from '../../data/flowers';

// Generate random positions for flowers on the canvas.
// Expands CartFlower entries (type + count) into individual PlacedFlower
// instances, each with a random (x, y) and sequential zIndex.
export function generatePlacements(cart: CartFlower[]): PlacedFlower[] {
  const placed: PlacedFlower[] = [];
  let zIndex = 1;

  // Bounds for random placement — keep flowers fully inside the canvas
  const maxX = CANVAS_WIDTH - FLOWER_SIZE;
  const maxY = CANVAS_HEIGHT - FLOWER_SIZE;

  for (const item of cart) {
    for (let i = 0; i < item.count; i++) {
      placed.push({
        id: crypto.randomUUID(),
        type: item.type,
        x: Math.round(Math.random() * maxX),
        y: Math.round(Math.random() * maxY),
        zIndex: zIndex++,
      });
    }
  }

  return placed;
}
