// Garden page — the user's saved bouquet collection.
// Shows a grid of thumbnails when bouquets exist, or an empty state with a CTA.

import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import {
  selectAllBouquets,
  selectGardenIsEmpty,
} from '../features/garden/gardenSlice';
import { GardenGrid } from '../features/garden/GardenGrid';

const GardenPage: React.FC = () => {
  const navigate = useNavigate();
  const bouquets = useAppSelector(selectAllBouquets);
  const isEmpty = useAppSelector(selectGardenIsEmpty);

  return (
    <div className="flex flex-col items-center min-h-[70vh] px-6 py-10 animate-fade-in-up">
      {/* Page header — Pinyon Script title, DM Sans subtitle */}
      <h1 className="font-logo text-5xl sm:text-6xl text-rose-dark mb-1">
        My Garden
      </h1>
      <p className="font-note text-base text-subtitle mb-8">
        Your saved bouquets
      </p>

      {isEmpty ? (
        // Empty state — encourage the user to create their first bouquet
        <div className="flex flex-col items-center justify-center flex-1 text-center gap-4 mt-12">
          <p className="font-note text-xl font-semibold">
            Your garden is empty
          </p>
          <p className="font-note text-base text-subtitle">
            Create your first bouquet!
          </p>
          <button
            className="mt-4 px-8 py-2.5 bg-rose text-white font-note text-sm font-semibold rounded-lg hover:bg-rose-dark hover:shadow-lg transition-all duration-300"
            onClick={() => navigate('/build')}
          >
            Create a Bouquet
          </button>
        </div>
      ) : (
        // Bouquet grid + back-to-home button
        <>
          <GardenGrid bouquets={bouquets} />

          <button
            className="mt-10 px-8 py-2.5 border-2 border-rose text-rose font-note text-sm font-semibold rounded-lg hover:bg-rose-light transition-all duration-300"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </>
      )}
    </div>
  );
};

export default GardenPage;
