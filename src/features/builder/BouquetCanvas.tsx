// BouquetCanvas — the main drag-and-drop arrangement canvas.
// Renders greenery background, draggable flowers, and the note card
// within a DndContext. Scales down on mobile to fit the viewport.

import { useState, useEffect, useRef, useCallback } from 'react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { updateFlowerPosition, updateNotePosition } from './builderSlice';
import { DraggableFlower } from './DraggableFlower';
import { NoteCard } from './NoteCard';
import { FlowerControls } from './FlowerControls';
import {
  GREENERY_OPTIONS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  FLOWER_SIZE,
  NOTE_WIDTH,
} from '../../data/flowers';

// Greenery image dimensions and offset on the canvas
const GREENERY_SIZE = 500;
const GREENERY_X = 150;
const GREENERY_Y = 50;

// Clamp a value between min and max (inclusive)
const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const BouquetCanvas: React.FC = () => {
  const dispatch = useAppDispatch();
  const placedFlowers = useAppSelector((state) => state.builder.placedFlowers);
  const note = useAppSelector((state) => state.builder.note);
  const greenery = useAppSelector((state) => state.builder.greenery);

  const [selectedFlowerId, setSelectedFlowerId] = useState<string | null>(null);

  // Responsive scaling — shrink canvas when viewport is narrower than 800px
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (wrapperRef.current) {
        const wrapperWidth = wrapperRef.current.clientWidth;
        setScale(Math.min(1, wrapperWidth / CANVAS_WIDTH));
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Resolve greenery asset from the catalog (null when 'none' is selected)
  const greeneryMeta =
    greenery !== 'none'
      ? GREENERY_OPTIONS.find((g) => g.type === greenery)
      : undefined;
  const greeneryAsset = greeneryMeta?.asset ?? null;

  // Highest zIndex among placed flowers (for stacking controls + note above)
  const maxFlowerZ =
    placedFlowers.length > 0
      ? Math.max(...placedFlowers.map((f) => f.zIndex))
      : 0;

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      const dragId = String(active.id);

      // Check if the dragged item is the note card
      // Use a minimum height estimate for Y clamping (note height varies with text)
      if (dragId === 'note-card' && note) {
        const NOTE_MIN_HEIGHT = 60;
        const newX = clamp(note.x + delta.x, 0, CANVAS_WIDTH - NOTE_WIDTH);
        const newY = clamp(note.y + delta.y, 0, CANVAS_HEIGHT - NOTE_MIN_HEIGHT);
        dispatch(updateNotePosition({ x: newX, y: newY }));
        return;
      }

      // Otherwise it's a flower
      const flower = placedFlowers.find((f) => f.id === dragId);
      if (!flower) return;

      const newX = clamp(flower.x + delta.x, 0, CANVAS_WIDTH - FLOWER_SIZE);
      const newY = clamp(flower.y + delta.y, 0, CANVAS_HEIGHT - FLOWER_SIZE);
      dispatch(updateFlowerPosition({ id: dragId, x: newX, y: newY }));
    },
    [dispatch, placedFlowers, note]
  );

  // Deselect flower when clicking the canvas background
  const handleCanvasClick = () => {
    setSelectedFlowerId(null);
  };

  // Find the currently selected flower for FlowerControls positioning
  const selectedFlower = placedFlowers.find((f) => f.id === selectedFlowerId);

  return (
    <div
      ref={wrapperRef}
      style={{ width: '100%', height: CANVAS_HEIGHT * scale + 4 }}
    >
      <DndContext onDragEnd={handleDragEnd}>
        <div
          className="relative bg-cream overflow-hidden shadow-lg rounded-xl border border-rose-light"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          onClick={handleCanvasClick}
        >
          {/* Layer 1: Greenery background (always behind flowers) */}
          {greeneryAsset && greeneryMeta && (
            <img
              src={greeneryAsset}
              alt={greeneryMeta.name}
              draggable={false}
              className="absolute pointer-events-none select-none"
              style={{
                left: GREENERY_X,
                top: GREENERY_Y,
                width: GREENERY_SIZE,
                height: GREENERY_SIZE,
                zIndex: 0,
              }}
            />
          )}

          {/* Layer 2: Draggable flowers */}
          {placedFlowers.map((flower) => (
            <DraggableFlower
              key={flower.id}
              flower={flower}
              isSelected={flower.id === selectedFlowerId}
              onSelect={setSelectedFlowerId}
            />
          ))}

          {/* Layer 3: Note card (rendered on top of flowers) */}
          {note && (
            <NoteCard note={note} zIndex={maxFlowerZ + 1} />
          )}

          {/* Floating z-index controls for the selected flower */}
          {selectedFlower && (
            <FlowerControls
              flowerId={selectedFlower.id}
              flowerX={selectedFlower.x}
              flowerY={selectedFlower.y}
            />
          )}
        </div>
      </DndContext>
    </div>
  );
};
