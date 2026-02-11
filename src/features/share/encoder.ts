// Encoder — converts a Bouquet to a compressed URL parameter.
// Strips fields that can be regenerated on decode (id, createdAt, canvas dimensions)
// to minimize URL length.

import type { Bouquet } from '../../types';
import { compress } from '../../utils/compression';

// Compact shape for URL encoding — short keys to save bytes
interface EncodedFlower {
  t: string; // flower type
  x: number;
  y: number;
  z: number; // zIndex
}

interface EncodedBouquet {
  f: EncodedFlower[]; // flowers
  n: { t: string; ff: string; x: number; y: number } | null; // note
  g: string; // greenery type
}

export function encodeBouquet(bouquet: Bouquet): string {
  const data: EncodedBouquet = {
    f: bouquet.flowers.map((f) => ({
      t: f.type,
      x: f.x,
      y: f.y,
      z: f.zIndex,
    })),
    n: bouquet.note
      ? {
          t: bouquet.note.text,
          ff: bouquet.note.fontFamily,
          x: bouquet.note.x,
          y: bouquet.note.y,
        }
      : null,
    g: bouquet.greenery,
  };

  return compress(JSON.stringify(data));
}
