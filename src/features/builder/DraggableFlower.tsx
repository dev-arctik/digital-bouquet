// DraggableFlower — a single flower on the canvas that can be dragged.
// Uses @dnd-kit/core's useDraggable hook for positioning.
// Clicking/tapping a flower brings it to the top of the stack.
// On mount, animates from canvas center to its random position so users
// understand the flowers are movable.

import { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useAppDispatch } from '../../app/hooks';
import { bringToTop } from './builderSlice';
import type { PlacedFlower } from '../../types';
import { FLOWERS, FLOWER_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../data/flowers';

interface DraggableFlowerProps {
  flower: PlacedFlower;
}

// Canvas center point (where flowers animate FROM)
const CENTER_X = (CANVAS_WIDTH - FLOWER_SIZE) / 2;
const CENTER_Y = (CANVAS_HEIGHT - FLOWER_SIZE) / 2;

export const DraggableFlower: React.FC<DraggableFlowerProps> = ({
  flower,
}) => {
  const dispatch = useAppDispatch();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: flower.id });

  // Two-phase entrance animation:
  // 1. hasAnimated=false: flower sits at canvas center
  // 2. hasAnimated=true, isEntering=true: transition to final position (0.6s)
  // 3. isEntering=false: no more transitions (manual drags are instant)
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    // Start the slide-out animation after a brief paint at center
    const startTimer = setTimeout(() => {
      setHasAnimated(true);
      setIsEntering(true);
    }, 50);
    // Turn off transitions after the entrance animation completes
    const endTimer = setTimeout(() => setIsEntering(false), 700);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, []);

  // Look up the asset path from the flower catalog
  const meta = FLOWERS.find((f) => f.type === flower.type);

  // Apply drag offset as a CSS transform (keeps DOM position stable)
  const dragTransform = transform
    ? CSS.Translate.toString(transform)
    : undefined;

  // Bring flower to top on click/tap (skip if it was a drag gesture)
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      dispatch(bringToTop(flower.id));
    }
  };

  // Before animation: start at center. After: move to actual position.
  const currentX = hasAnimated ? flower.x : CENTER_X;
  const currentY = hasAnimated ? flower.y : CENTER_Y;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className="absolute cursor-grab active:cursor-grabbing"
      style={{
        left: currentX,
        top: currentY,
        zIndex: flower.zIndex,
        width: FLOWER_SIZE,
        height: FLOWER_SIZE,
        transform: dragTransform,
        // Prevent browser from hijacking touch gestures (scroll/zoom) on draggable elements
        touchAction: 'none',
        // Only animate during the initial entrance — manual drags are instant
        transition: isEntering ? 'left 0.6s ease-out, top 0.6s ease-out' : 'none',
        // Lift dragged flower visually above everything
        ...(isDragging && { zIndex: 9999 }),
      }}
    >
      {meta && (
        <img
          src={meta.asset}
          alt={meta.name}
          draggable={false}
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      )}
    </div>
  );
};
