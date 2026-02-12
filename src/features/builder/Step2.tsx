// Step 2 — Arrange Your Bouquet.
// Users drag flowers on the canvas, pick greenery, and add a note.
// On mount, generates random placements from the cart if placedFlowers is empty.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StickyNote, PenLine } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setPlacedFlowers, goBackToStep1 } from './builderSlice';
import { StepNavigation } from '../../components/StepNavigation';
import { BouquetCanvas } from './BouquetCanvas';
import { GreenerySelector } from './GreenerySelector';
import { NoteModal } from './NoteModal';
import { generatePlacements } from './PlacementEngine';

export const Step2: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cart = useAppSelector((state) => state.builder.cart);
  const placedFlowers = useAppSelector((state) => state.builder.placedFlowers);
  const note = useAppSelector((state) => state.builder.note);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Redirect to home if no flowers were picked (direct URL access)
  const hasNoFlowers = cart.length === 0 && placedFlowers.length === 0;
  useEffect(() => {
    if (hasNoFlowers) {
      navigate('/', { replace: true });
    }
  }, [hasNoFlowers, navigate]);

  // Generate random placements on first entry (empty placedFlowers)
  useEffect(() => {
    if (placedFlowers.length === 0 && cart.length > 0) {
      dispatch(setPlacedFlowers(generatePlacements(cart)));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Don't render anything while redirecting — avoids errors from empty state
  if (hasNoFlowers) return null;

  const handleBack = () => {
    dispatch(goBackToStep1());
    navigate('/build/pick');
  };

  const handleNext = () => {
    navigate('/build/preview');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 animate-fade-in-up w-full overflow-hidden">
      {/* Title + instruction */}
      <h2 className="font-note text-2xl sm:text-4xl md:text-5xl text-center font-bold px-2">
        Arrange Your Bouquet
      </h2>
      <p className="font-note text-sm text-subtitle text-center px-2">
        Drag the flowers to arrange them as you want
      </p>

      {/* Drag-and-drop canvas */}
      <BouquetCanvas />

      {/* Greenery dropdown + Note button — wrap on mobile */}
      <div className="flex flex-wrap items-center justify-center gap-3 px-2">
        <GreenerySelector />
        <button
          onClick={() => setIsNoteModalOpen(true)}
          className="px-6 py-2.5 border-2 border-rose text-rose rounded-lg font-note text-sm font-semibold hover:bg-rose-light transition-all duration-300"
        >
          {note ? <><PenLine size={14} className="inline -mt-0.5" /> Edit Your Note</> : <><StickyNote size={14} className="inline -mt-0.5" /> Add a Custom Note</>}
        </button>
      </div>

      {/* Note editor modal */}
      <NoteModal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} />

      {/* BACK / NEXT navigation */}
      <StepNavigation onBack={handleBack} onNext={handleNext} />
    </div>
  );
};
