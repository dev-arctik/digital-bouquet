// GardenGrid — responsive grid of bouquet thumbnail cards.
// Bouquets arrive pre-sorted (newest first) from the selector.

import { useState } from 'react';
import type { Bouquet } from '../../types';
import { BouquetCard } from './BouquetCard';
import { PreviewModal } from './PreviewModal';

interface GardenGridProps {
  bouquets: Bouquet[];
}

export const GardenGrid: React.FC<GardenGridProps> = ({ bouquets }) => {
  const [selectedBouquet, setSelectedBouquet] = useState<Bouquet | null>(null);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-6">
        {bouquets.map((bouquet) => (
          <BouquetCard
            key={bouquet.id}
            bouquet={bouquet}
            onClick={() => setSelectedBouquet(bouquet)}
          />
        ))}
      </div>

      <PreviewModal
        bouquet={selectedBouquet}
        onClose={() => setSelectedBouquet(null)}
      />
    </>
  );
};
