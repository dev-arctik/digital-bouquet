// BouquetPreview — read-only rendering of a complete bouquet.
// Used in Step 3 preview, ViewerPage, and Garden thumbnails.
// Supports forwardRef so html-to-image can capture the DOM node.

import { forwardRef } from 'react';
import type { PlacedFlower, Note, GreeneryType } from '../../types';
import {
  FLOWERS,
  GREENERY_OPTIONS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  FLOWER_SIZE,
  NOTE_WIDTH,
} from '../../data/flowers';

interface BouquetPreviewProps {
  flowers: PlacedFlower[];
  note: Note | null;
  greenery: GreeneryType;
  showNote?: boolean;
}

// Greenery is rendered at a fixed position and size
const GREENERY_X = 150;
const GREENERY_Y = 50;
const GREENERY_SIZE = 500;

export const BouquetPreview = forwardRef<HTMLDivElement, BouquetPreviewProps>(
  function BouquetPreview({ flowers, note, greenery, showNote = true }, ref) {
    // Find the greenery asset if one is selected
    const greeneryMeta = greenery !== 'none'
      ? GREENERY_OPTIONS.find((g) => g.type === greenery)
      : null;

    // Compute the highest flower z-index for layering the note above flowers
    const maxFlowerZ = flowers.length > 0
      ? Math.max(...flowers.map((f) => f.zIndex))
      : 0;

    return (
      <div
        ref={ref}
        className="bg-cream"
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Layer 1: Greenery background */}
        {greeneryMeta?.asset && (
          <img
            src={greeneryMeta.asset}
            alt={greeneryMeta.name}
            draggable={false}
            style={{
              position: 'absolute',
              left: GREENERY_X,
              top: GREENERY_Y,
              width: GREENERY_SIZE,
              height: GREENERY_SIZE,
              zIndex: 0,
            }}
          />
        )}

        {/* Layer 2: Flowers at their saved positions */}
        {flowers.map((flower) => {
          const meta = FLOWERS.find((f) => f.type === flower.type);
          if (!meta) return null;

          return (
            <img
              key={flower.id}
              src={meta.asset}
              alt={meta.name}
              draggable={false}
              style={{
                position: 'absolute',
                left: flower.x,
                top: flower.y,
                width: FLOWER_SIZE,
                height: FLOWER_SIZE,
                zIndex: flower.zIndex,
              }}
            />
          );
        })}

        {/* Layer 3: Static note card (above all flowers) */}
        {showNote && note && (
          <div
            className="bg-white border-2 border-rose-dark rounded-lg shadow-sm p-3"
            style={{
              position: 'absolute',
              left: note.x,
              top: note.y,
              width: NOTE_WIDTH,
              zIndex: maxFlowerZ + 1,
            }}
          >
            <p className="font-note text-sm leading-relaxed break-words whitespace-pre-wrap m-0">
              {note.text}
            </p>
          </div>
        )}
      </div>
    );
  }
);
