// Flower catalog, greenery options, and design constants.
// This is the single source of truth for all flower/greenery metadata.

import type { FlowerMeta, GreeneryMeta } from '../types';

// Asset imports — Vite resolves these to hashed URLs at build time.
// Watercolor-style PNGs sourced from paulinewee/digibouquet.
import roseAsset from '../assets/flowers/rose.png';
import tulipAsset from '../assets/flowers/tulip.png';
import sunflowerAsset from '../assets/flowers/sunflower.png';
import lilyAsset from '../assets/flowers/lily.png';
import daisyAsset from '../assets/flowers/daisy.png';
import peonyAsset from '../assets/flowers/peony.png';
import orchidAsset from '../assets/flowers/orchid.png';
import carnationAsset from '../assets/flowers/carnation.png';
import dahliaAsset from '../assets/flowers/dahlia.png';

import bushAsset from '../assets/greenery/bush.png';
import monsteraAsset from '../assets/greenery/monstera.png';
import sprigsAsset from '../assets/greenery/sprigs.png';

// The 9 flower types available in the catalog
export const FLOWERS: FlowerMeta[] = [
  { type: 'rose', name: 'Rose', asset: roseAsset },
  { type: 'tulip', name: 'Tulip', asset: tulipAsset },
  { type: 'sunflower', name: 'Sunflower', asset: sunflowerAsset },
  { type: 'lily', name: 'Lily', asset: lilyAsset },
  { type: 'daisy', name: 'Daisy', asset: daisyAsset },
  { type: 'peony', name: 'Peony', asset: peonyAsset },
  { type: 'orchid', name: 'Orchid', asset: orchidAsset },
  { type: 'carnation', name: 'Carnation', asset: carnationAsset },
  { type: 'dahlia', name: 'Dahlia', asset: dahliaAsset },
];

// Greenery background options — 'none' has no asset
export const GREENERY_OPTIONS: GreeneryMeta[] = [
  { type: 'none', name: 'None', asset: null },
  { type: 'bush', name: 'Bush', asset: bushAsset },
  { type: 'monstera', name: 'Monstera', asset: monsteraAsset },
  { type: 'sprigs', name: 'Sprigs', asset: sprigsAsset },
];

// -- Design constants --

// Canvas dimensions (4:3 aspect ratio)
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Maximum flowers allowed per bouquet
export const MAX_FLOWERS = 6;

// Note constraints
export const MAX_NOTE_WORDS = 50;
export const NOTE_WIDTH = 200; // base width (short notes)
const NOTE_MAX_WIDTH = 280;    // cap (long notes)

// Dynamic note width — grows sublinearly via sqrt so longer notes
// get a bit wider without dominating the canvas
export function getNoteWidth(text: string): number {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const extra = Math.sqrt(wordCount) * 10;
  return Math.min(NOTE_WIDTH + extra, NOTE_MAX_WIDTH);
}

// Default note position: bottom-center, avoids greenery overlap
export const DEFAULT_NOTE_POSITION = { x: 300, y: 480 } as const;

// Standard flower size on canvas (px) — 120 for visual impact
export const FLOWER_SIZE = 120;

// Allowed fonts for the note card (extensible later)
export const ALLOWED_FONTS = ['DM Sans'] as const;
