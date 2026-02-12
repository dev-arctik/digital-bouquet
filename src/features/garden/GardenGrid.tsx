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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
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
