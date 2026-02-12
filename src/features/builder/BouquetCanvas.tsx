// BouquetCanvas — the main drag-and-drop arrangement canvas.
// Renders greenery background, draggable flowers, and the note card
// within a DndContext. Scales down on mobile to fit the viewport.

import { useState, useEffect, useRef, useCallback } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
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
  getNoteWidth,
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

  // Require 5px movement before starting a drag — allows clicks to register
  // for flower selection without being captured as drag events
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const sensors = useSensors(pointerSensor);

  // Responsive scaling — shrink canvas when viewport is narrower than 800px
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Start with a safe initial scale so the 800px canvas doesn't inflate layout on first render
  const [scale, setScale] = useState(() =>
    typeof window !== 'undefined' ? Math.min(1, (window.innerWidth - 32) / CANVAS_WIDTH) : 1
  );

  // Scale canvas to fit both available width AND viewport height
  useEffect(() => {
    const updateScale = () => {
      // Use viewport width minus page padding (px-4 = 16px each side) as upper bound —
      // clientWidth can be inflated by overflowing children, so cap it
      const maxAvailableWidth = window.innerWidth - 32;
      const wrapperWidth = Math.min(
        wrapperRef.current?.clientWidth ?? maxAvailableWidth,
        maxAvailableWidth
      );
      const isMobile = window.innerWidth < 640;
      const maxHeight = window.innerHeight * (isMobile ? 0.55 : 0.50);
      setScale(Math.min(1, wrapperWidth / CANVAS_WIDTH, maxHeight / CANVAS_HEIGHT));
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

      // Convert screen-pixel deltas to canvas coordinates —
      // @dnd-kit measures in screen pixels, but our positions are in the
      // unscaled 800x600 canvas space
      const dx = delta.x / scale;
      const dy = delta.y / scale;

      // Check if the dragged item is the note card
      // Use a minimum height estimate for Y clamping (note height varies with text)
      if (dragId === 'note-card' && note) {
        const NOTE_MIN_HEIGHT = 60;
        const noteWidth = getNoteWidth(note.text);
        const newX = clamp(note.x + dx, 0, CANVAS_WIDTH - noteWidth);
        const newY = clamp(note.y + dy, 0, CANVAS_HEIGHT - NOTE_MIN_HEIGHT);
        dispatch(updateNotePosition({ x: newX, y: newY }));
        return;
      }

      // Otherwise it's a flower
      const flower = placedFlowers.find((f) => f.id === dragId);
      if (!flower) return;

      const newX = clamp(flower.x + dx, 0, CANVAS_WIDTH - FLOWER_SIZE);
      const newY = clamp(flower.y + dy, 0, CANVAS_HEIGHT - FLOWER_SIZE);
      dispatch(updateFlowerPosition({ id: dragId, x: newX, y: newY }));
    },
    [dispatch, placedFlowers, note, scale]
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
      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
    >
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {/* Layout wrapper — matches the visual size of the scaled canvas
            so the 800px element doesn't overflow the viewport */}
        <div style={{ width: CANVAS_WIDTH * scale, height: CANVAS_HEIGHT * scale, overflow: 'hidden' }}>
          <div
            className="relative bg-white overflow-hidden shadow-lg rounded-xl border border-rose-light"
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
        </div>
      </DndContext>
    </div>
  );
};
