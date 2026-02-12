// FlowerControls — floating toolbar for z-index reordering.
// Appears below the selected flower with FRONT/BACK buttons.
// Buttons are sized large enough to remain tappable when the canvas
// scales down on mobile (~0.45x).

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { bringToFront, sendToBack } from './builderSlice';
import { FLOWER_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../data/flowers';

interface FlowerControlsProps {
  flowerId: string;
  flowerX: number;
  flowerY: number;
}

export const FlowerControls: React.FC<FlowerControlsProps> = ({
  flowerId,
  flowerX,
  flowerY,
}) => {
  const dispatch = useAppDispatch();
  const placedFlowers = useAppSelector((state) => state.builder.placedFlowers);

  const currentFlower = placedFlowers.find((f) => f.id === flowerId);
  if (!currentFlower) return null;

  const maxZ = Math.max(...placedFlowers.map((f) => f.zIndex));
  const minZ = Math.min(...placedFlowers.map((f) => f.zIndex));

  const isAtFront = currentFlower.zIndex === maxZ;
  const isAtBack = currentFlower.zIndex === minZ;

  // Position toolbar below the flower; flip above if near canvas bottom
  const TOOLBAR_HEIGHT = 40;
  const belowY = flowerY + FLOWER_SIZE + 4;
  const aboveY = flowerY - TOOLBAR_HEIGHT - 4;
  const toolbarY = belowY + TOOLBAR_HEIGHT > CANVAS_HEIGHT ? Math.max(0, aboveY) : belowY;

  // Keep toolbar within horizontal canvas bounds
  const toolbarX = Math.min(flowerX, CANVAS_WIDTH - 140);

  return (
    <div
      className="flex gap-1 absolute"
      style={{
        left: toolbarX,
        top: toolbarY,
        zIndex: maxZ + 10,
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); dispatch(bringToFront(flowerId)); }}
        disabled={isAtFront}
        className={`px-3 py-1.5 text-xs uppercase tracking-widest font-bold border-2 rounded-lg font-note transition-all duration-200 bg-white ${
          isAtFront
            ? 'border-disabled text-disabled cursor-not-allowed'
            : 'border-rose text-rose hover:bg-rose hover:text-white'
        }`}
      >
        Front
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); dispatch(sendToBack(flowerId)); }}
        disabled={isAtBack}
        className={`px-3 py-1.5 text-xs uppercase tracking-widest font-bold border-2 rounded-lg font-note transition-all duration-200 bg-white ${
          isAtBack
            ? 'border-disabled text-disabled cursor-not-allowed'
            : 'border-rose text-rose hover:bg-rose hover:text-white'
        }`}
      >
        Back
      </button>
    </div>
  );
};
