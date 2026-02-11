// Step 2 — Arrange Your Bouquet.
// Users drag flowers on the canvas, pick greenery, and add a note.
// On mount, generates random placements from the cart if placedFlowers is empty.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  // Generate random placements on first entry (empty placedFlowers)
  useEffect(() => {
    if (placedFlowers.length === 0 && cart.length > 0) {
      dispatch(setPlacedFlowers(generatePlacements(cart)));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBack = () => {
    dispatch(goBackToStep1());
    navigate('/build/pick');
  };

  const handleNext = () => {
    navigate('/build/preview');
  };

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in-up">
      {/* Title */}
      <h2 className="font-logo text-4xl sm:text-5xl text-center">
        Arrange Your Bouquet
      </h2>

      {/* Instruction hint */}
      <p className="font-note text-sm text-subtitle">
        Drag the flowers to arrange them as you want
      </p>

      {/* Greenery dropdown */}
      <GreenerySelector />

      {/* Drag-and-drop canvas */}
      <BouquetCanvas />

      {/* Add/Edit Note button */}
      <button
        onClick={() => setIsNoteModalOpen(true)}
        className="px-6 py-3 border-2 border-rose text-rose rounded-lg font-note text-sm font-semibold hover:bg-rose-light transition-all duration-300"
      >
        {note ? 'Edit Note' : 'Add Note'}
      </button>

      {/* Note editor modal */}
      <NoteModal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} />

      {/* BACK / NEXT navigation */}
      <StepNavigation onBack={handleBack} onNext={handleNext} />
    </div>
  );
};
