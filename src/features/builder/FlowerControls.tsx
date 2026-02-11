// FlowerControls — floating toolbar for z-index reordering.
// Appears near the selected flower with FRONT/BACK buttons.

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { bringToFront, sendToBack } from './builderSlice';

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

  // Position toolbar above the flower, centered horizontally
  const toolbarY = Math.max(0, flowerY - 36);

  return (
    <div
      className="flex gap-1 absolute"
      style={{
        left: flowerX,
        top: toolbarY,
        zIndex: maxZ + 10,
      }}
    >
      <button
        onClick={() => dispatch(bringToFront(flowerId))}
        disabled={isAtFront}
        className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold border-2 rounded-lg font-note transition-all duration-200 ${
          isAtFront
            ? 'border-disabled text-disabled cursor-not-allowed rounded-lg'
            : 'border-rose text-rose hover:bg-rose hover:text-white'
        }`}
      >
        Front
      </button>
      <button
        onClick={() => dispatch(sendToBack(flowerId))}
        disabled={isAtBack}
        className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold border-2 rounded-lg font-note transition-all duration-200 ${
          isAtBack
            ? 'border-disabled text-disabled cursor-not-allowed rounded-lg'
            : 'border-rose text-rose hover:bg-rose hover:text-white'
        }`}
      >
        Back
      </button>
    </div>
  );
};
