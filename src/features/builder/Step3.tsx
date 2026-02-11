// Step 3 — Preview & Share.
// Shows a read-only bouquet preview with share, save, and export actions.
// Handles unsaved-work warnings when navigating away.

import { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';

import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { useToast } from '../../components/Toast';
import type { Bouquet } from '../../types';
import { resetBuilder } from './builderSlice';
import { saveBouquet } from '../garden/gardenSlice';
import { BouquetPreview } from './BouquetPreview';
import { ShareActions } from '../share/ShareActions';
import { UnsavedWorkModal } from './UnsavedWorkModal';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../data/flowers';
import { hasStorageRoom } from '../../utils/storage';

// Tracks where the user intends to go when the unsaved modal triggers
type LeaveTarget = 'new' | 'garden' | null;

export const Step3: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const builder = useAppSelector((state) => state.builder);

  const previewRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState<LeaveTarget>(null);
  const [scale, setScale] = useState(1);

  // Responsive scaling — fit preview within available width AND viewport height
  useEffect(() => {
    const updateScale = () => {
      if (wrapperRef.current) {
        const widthScale = wrapperRef.current.clientWidth / CANVAS_WIDTH;
        // Cap height to ~50vh so the page doesn't scroll on desktop
        const maxPreviewHeight = window.innerHeight * 0.50;
        const heightScale = maxPreviewHeight / CANVAS_HEIGHT;
        setScale(Math.min(1, widthScale, heightScale));
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Stable ID: generated once per mount, so BACK+NEXT doesn't create duplicates
  const [bouquetId] = useState(
    () => builder.editingBouquetId ?? crypto.randomUUID()
  );
  const [createdAt] = useState(() => new Date().toISOString());

  // Build the Bouquet object from Redux builder state
  const bouquet: Bouquet = useMemo(
    () => ({
      id: bouquetId,
      flowers: builder.placedFlowers,
      note: builder.note,
      greenery: builder.greenery,
      canvasWidth: builder.canvasWidth,
      canvasHeight: builder.canvasHeight,
      createdAt,
    }),
    [
      bouquetId,
      createdAt,
      builder.placedFlowers,
      builder.note,
      builder.greenery,
      builder.canvasWidth,
      builder.canvasHeight,
    ]
  );

  // Save the current bouquet to the garden (localStorage)
  const handleSaveToGarden = () => {
    if (!hasStorageRoom()) {
      showToast('STORAGE IS FULL. TRY DELETING OLD BOUQUETS FIRST.', 'error');
      return;
    }
    dispatch(saveBouquet(bouquet));
    setIsSaved(true);
    showToast('BOUQUET SAVED TO GARDEN!', 'saved');
  };

  // Navigate away after saving or dismissing the unsaved modal
  const executeLeave = (target: LeaveTarget) => {
    if (target === 'new') {
      dispatch(resetBuilder());
      navigate('/build/pick');
    } else if (target === 'garden') {
      dispatch(resetBuilder());
      navigate('/garden');
    }
  };

  // Attempt to leave — show modal if unsaved, otherwise leave immediately
  const handleLeaveAttempt = (target: LeaveTarget) => {
    if (isSaved) {
      executeLeave(target);
    } else {
      setLeaveTarget(target);
    }
  };

  // Unsaved modal handlers — capture target before clearing state
  const handleSaveAndLeave = () => {
    const target = leaveTarget;
    handleSaveToGarden();
    setLeaveTarget(null);
    executeLeave(target);
  };

  const handleLeaveWithoutSaving = () => {
    const target = leaveTarget;
    setLeaveTarget(null);
    executeLeave(target);
  };

  const handleCancelLeave = () => {
    setLeaveTarget(null);
  };

  return (
    <div className="flex flex-col items-center gap-2 animate-fade-in-up">
      {/* Title */}
      <h2 className="font-note text-4xl sm:text-5xl text-center font-bold">
        Preview & Share
      </h2>

      {/* Centered bouquet preview */}
      <div ref={wrapperRef} className="w-full flex justify-center">
        <div
          className="shadow-lg rounded-xl overflow-hidden border border-rose-light"
          style={{ width: CANVAS_WIDTH * scale, height: CANVAS_HEIGHT * scale }}
        >
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <BouquetPreview
              ref={previewRef}
              flowers={bouquet.flowers}
              note={bouquet.note}
              greenery={bouquet.greenery}
            />
          </div>
        </div>
      </div>

      {/* Actions below preview — clear visual hierarchy */}
      <div className="w-full flex flex-col items-center gap-2" style={{ maxWidth: CANVAS_WIDTH * scale }}>
        {/* Primary + secondary action buttons */}
        <ShareActions
          bouquet={bouquet}
          previewRef={previewRef}
          onSaveToGarden={handleSaveToGarden}
          isSaved={isSaved}
          onViewGarden={() => navigate('/garden')}
        />

        {/* Tertiary navigation — outlined buttons matching secondary style */}
        <div className="flex gap-2 w-full">
          <button
            onClick={() => navigate('/build/arrange')}
            className="flex-1 border border-rose text-rose text-xs uppercase tracking-wider font-semibold py-2 px-4 rounded-lg font-note hover:bg-rose-light transition-all duration-200"
          >
            <ArrowLeft size={14} className="inline -mt-0.5" /> Back
          </button>
          <button
            onClick={() => handleLeaveAttempt('new')}
            className="flex-1 border border-rose text-rose text-xs uppercase tracking-wider font-semibold py-2 px-4 rounded-lg font-note hover:bg-rose-light transition-all duration-200"
          >
            <Plus size={14} className="inline -mt-0.5" /> Create New
          </button>
        </div>
      </div>

      {/* Unsaved work warning modal */}
      <UnsavedWorkModal
        isOpen={leaveTarget !== null}
        onSaveAndLeave={handleSaveAndLeave}
        onLeave={handleLeaveWithoutSaving}
        onCancel={handleCancelLeave}
      />
    </div>
  );
};
