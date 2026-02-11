// DraggableFlower — a single flower on the canvas that can be dragged.
// Uses @dnd-kit/core's useDraggable hook for positioning.

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { PlacedFlower } from '../../types';
import { FLOWERS, FLOWER_SIZE } from '../../data/flowers';

interface DraggableFlowerProps {
  flower: PlacedFlower;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const DraggableFlower: React.FC<DraggableFlowerProps> = ({
  flower,
  isSelected,
  onSelect,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: flower.id });

  // Look up the asset path from the flower catalog
  const meta = FLOWERS.find((f) => f.type === flower.type);

  // Apply drag offset as a CSS transform (keeps DOM position stable)
  const dragTransform = transform
    ? CSS.Translate.toString(transform)
    : undefined;

  // Select on click only when not dragging (isDragging stays true through the mouseup)
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      onSelect(flower.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={`absolute cursor-grab active:cursor-grabbing ${
        isSelected ? 'border-2 border-dashed border-rose' : ''
      }`}
      style={{
        left: flower.x,
        top: flower.y,
        zIndex: flower.zIndex,
        width: FLOWER_SIZE,
        height: FLOWER_SIZE,
        transform: dragTransform,
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
