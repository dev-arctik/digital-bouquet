// Individual flower tile in the 3x3 selection grid.
// Shows flower image + name; dispatches addToCart on click.
// Warm white card with soft rose border — consistent across all tiles.

import type { FlowerMeta } from '../../types';
import { useAppDispatch } from '../../app/hooks';
import { addToCart } from './builderSlice';

interface FlowerTileProps {
  flower: FlowerMeta;
  disabled: boolean;
}

export const FlowerTile: React.FC<FlowerTileProps> = ({ flower, disabled }) => {
  const dispatch = useAppDispatch();

  const handleClick = () => {
    if (disabled) return;
    dispatch(addToCart(flower.type));
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-label={`Add ${flower.name} to bouquet`}
      className={`flex flex-col items-center gap-2 bg-white border border-rose-light rounded-xl p-3 transition-all duration-300 ${
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer hover:shadow-lg hover:scale-[1.04] hover:-translate-y-1'
      }`}
    >
      <img
        src={flower.asset}
        alt={flower.name}
        className="w-16 h-16 object-contain"
      />
      <span className="text-sm font-note font-medium text-rose-dark">
        {flower.name}
      </span>
    </button>
  );
};
