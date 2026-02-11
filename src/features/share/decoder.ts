// Decoder — converts a compressed URL parameter back to a validated Bouquet.
// Performs strict validation on all fields to prevent malicious or corrupted data.

import type { Bouquet, FlowerType, GreeneryType } from '../../types';
import { decompress } from '../../utils/compression';
import {
  ALLOWED_FONTS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  MAX_FLOWERS,
  MAX_NOTE_WORDS,
} from '../../data/flowers';

const VALID_FLOWER_TYPES: FlowerType[] = [
  'rose',
  'tulip',
  'sunflower',
  'lily',
  'daisy',
  'peony',
  'orchid',
  'carnation',
  'dahlia',
];

const VALID_GREENERY_TYPES: GreeneryType[] = [
  'bush',
  'monstera',
  'sprigs',
  'none',
];

// Maximum character length for note text (safety cap beyond word limit)
const MAX_NOTE_CHARS = 1000;

// Strip HTML tags from text to prevent injection
function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

// Type guard — checks if a value is a number within a range
function isNumberInRange(
  value: unknown,
  min: number,
  max: number
): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && value >= min && value <= max;
}

// Validate the parsed JSON structure against bouquet constraints
function validateBouquetData(parsed: unknown): boolean {
  if (typeof parsed !== 'object' || parsed === null) return false;

  const data = parsed as Record<string, unknown>;

  // Validate flowers array
  if (!Array.isArray(data.f) || data.f.length < 1 || data.f.length > MAX_FLOWERS) {
    return false;
  }

  for (const flower of data.f) {
    if (typeof flower !== 'object' || flower === null) return false;
    const f = flower as Record<string, unknown>;

    if (!VALID_FLOWER_TYPES.includes(f.t as FlowerType)) return false;
    if (!isNumberInRange(f.x, 0, CANVAS_WIDTH)) return false;
    if (!isNumberInRange(f.y, 0, CANVAS_HEIGHT)) return false;
    if (!isNumberInRange(f.z, 1, data.f.length)) return false;
    if (!Number.isInteger(f.z)) return false;
  }

  // Ensure all z-indices are unique (no two flowers on the same layer)
  const zIndices = (data.f as { z: number }[]).map((f) => f.z);
  if (new Set(zIndices).size !== zIndices.length) return false;

  // Validate note (null is valid)
  if (data.n !== null) {
    if (typeof data.n !== 'object') return false;
    const n = data.n as Record<string, unknown>;

    if (typeof n.t !== 'string') return false;
    const cleanText = stripHtml(n.t);
    if (cleanText.length > MAX_NOTE_CHARS) return false;

    // Word count check — split on whitespace, filter empty strings
    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
    if (wordCount > MAX_NOTE_WORDS) return false;

    if (typeof n.ff !== 'string') return false;
    if (!ALLOWED_FONTS.includes(n.ff as (typeof ALLOWED_FONTS)[number])) return false;

    if (!isNumberInRange(n.x, 0, CANVAS_WIDTH)) return false;
    if (!isNumberInRange(n.y, 0, CANVAS_HEIGHT)) return false;
  }

  // Validate greenery type
  if (!VALID_GREENERY_TYPES.includes(data.g as GreeneryType)) return false;

  return true;
}

export function decodeBouquet(data: string): Bouquet | null {
  try {
    const decompressed = decompress(data);
    if (!decompressed) return null;

    const parsed: unknown = JSON.parse(decompressed);
    if (!validateBouquetData(parsed)) return null;

    // Safe to cast after validation
    const validated = parsed as {
      f: { t: string; x: number; y: number; z: number }[];
      n: { t: string; ff: string; x: number; y: number } | null;
      g: string;
    };

    // Rebuild a full Bouquet with regenerated ids and timestamps
    const bouquet: Bouquet = {
      id: crypto.randomUUID(),
      flowers: validated.f.map((f) => ({
        id: crypto.randomUUID(),
        type: f.t as FlowerType,
        x: f.x,
        y: f.y,
        zIndex: f.z,
      })),
      note: validated.n
        ? {
            text: stripHtml(validated.n.t),
            fontFamily: validated.n.ff,
            x: validated.n.x,
            y: validated.n.y,
          }
        : null,
      greenery: validated.g as GreeneryType,
      canvasWidth: CANVAS_WIDTH,
      canvasHeight: CANVAS_HEIGHT,
      createdAt: new Date().toISOString(),
    };

    return bouquet;
  } catch {
    // JSON.parse failure or any other unexpected error
    return null;
  }
}
