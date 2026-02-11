// 3x3 grid of all 9 flower types for step 1 selection.
// Each tile adds a flower to the cart on click.
// Tiles are disabled when the cart reaches MAX_FLOWERS.

import { useAppSelector } from '../../app/hooks';
import { FLOWERS, MAX_FLOWERS } from '../../data/flowers';
import { FlowerTile } from './FlowerTile';

export const FlowerGrid: React.FC = () => {
  const cart = useAppSelector((state) => state.builder.cart);

  // Derive total flower count to disable tiles at max
  const totalCount = cart.reduce((sum, item) => sum + item.count, 0);
  const isAtMax = totalCount >= MAX_FLOWERS;

  return (
    <div
      className="grid grid-cols-3 gap-3"
      role="group"
      aria-label="Flower selection grid"
    >
      {FLOWERS.map((flower) => (
        <FlowerTile key={flower.type} flower={flower} disabled={isAtMax} />
      ))}
    </div>
  );
};
