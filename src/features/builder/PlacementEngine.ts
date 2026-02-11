// PlacementEngine — generates canvas positions for cart flowers.
// Arranges flowers in a fan/arc pattern in the upper portion of the canvas,
// spreading outward from center at varying distances so the bouquet
// looks natural and intentional (not scattered in random corners).

import type { CartFlower, PlacedFlower } from '../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, FLOWER_SIZE } from '../../data/flowers';

// Center point of the canvas (where flowers fan out from)
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;

// Clamp a value within bounds
const clamp = (val: number, min: number, max: number) =>
  Math.max(min, Math.min(max, val));

// Generate positions in a circular fan pattern across the upper ~270 degrees.
// Flowers spread outward from center at different distances with slight
// randomness so it feels organic, not mechanical.
export function generatePlacements(cart: CartFlower[]): PlacedFlower[] {
  const placed: PlacedFlower[] = [];
  let zIndex = 1;

  // Flatten cart into individual flower entries
  const flowers: { type: CartFlower['type'] }[] = [];
  for (const item of cart) {
    for (let i = 0; i < item.count; i++) {
      flowers.push({ type: item.type });
    }
  }

  const total = flowers.length;

  // Fan arc: sweep from -135deg to +135deg (270 degrees centered on top)
  // This keeps flowers in the upper/side areas, avoiding the bottom center
  const ARC_START = -135 * (Math.PI / 180); // -135 degrees
  const ARC_END = 135 * (Math.PI / 180);    // +135 degrees
  const ARC_RANGE = ARC_END - ARC_START;

  // Distance range from center — vary so flowers don't sit in a perfect ring
  const MIN_RADIUS = 80;
  const MAX_RADIUS = 200;

  for (let i = 0; i < total; i++) {
    // Evenly distribute angles across the arc, with a small random nudge
    const baseAngle = ARC_START + (ARC_RANGE * (i + 0.5)) / total;
    const angleJitter = (Math.random() - 0.5) * 0.3; // slight random offset
    const angle = baseAngle + angleJitter;

    // Alternate between closer and farther distances for a natural look
    const radiusFraction = (i % 2 === 0) ? 0.6 : 1.0;
    const baseRadius = MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * radiusFraction;
    const radiusJitter = (Math.random() - 0.5) * 40; // ±20px randomness
    const radius = baseRadius + radiusJitter;

    // Convert polar to cartesian (angle 0 = top, rotating clockwise)
    const rawX = CENTER_X + radius * Math.sin(angle) - FLOWER_SIZE / 2;
    const rawY = CENTER_Y - radius * Math.cos(angle) - FLOWER_SIZE / 2;

    // Keep flowers fully inside the canvas bounds
    const x = Math.round(clamp(rawX, 0, CANVAS_WIDTH - FLOWER_SIZE));
    const y = Math.round(clamp(rawY, 0, CANVAS_HEIGHT - FLOWER_SIZE));

    placed.push({
      id: crypto.randomUUID(),
      type: flowers[i]!.type,
      x,
      y,
      zIndex: zIndex++,
    });
  }

  return placed;
}
