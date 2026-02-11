// Step 3 — Preview & Share.
// Shows a read-only bouquet preview with share, save, and export actions.
// Handles unsaved-work warnings when navigating away.

import { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { useToast } from '../../components/Toast';
import type { Bouquet } from '../../types';
import { resetBuilder } from './builderSlice';
import { saveBouquet } from '../garden/gardenSlice';
import { BouquetPreview } from './BouquetPreview';
import { ShareActions } from '../share/ShareActions';
import { generateShareLink } from '../share/generateShareLink';
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
        // Cap height to ~60vh so the page doesn't scroll on desktop
        const maxPreviewHeight = window.innerHeight * 0.6;
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

  const shareLink = useMemo(() => generateShareLink(bouquet), [bouquet]);

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
    <div className="flex flex-col items-center gap-3 animate-fade-in-up">
      {/* Title */}
      <h2 className="font-logo text-4xl sm:text-5xl text-center">
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

      {/* Actions row below the preview */}
      <div className="w-full flex flex-col items-center gap-3" style={{ maxWidth: CANVAS_WIDTH * scale }}>
        {/* Share actions in a single row */}
        <div className="w-full flex flex-col sm:flex-row gap-2">
          <ShareActions
            bouquet={bouquet}
            previewRef={previewRef}
            onSaveToGarden={handleSaveToGarden}
            isSaved={isSaved}
          />
        </div>

        {/* Shareable link */}
        <input
          type="text"
          readOnly
          value={shareLink}
          className="w-full border border-rose-light rounded-lg bg-white font-mono text-xs px-3 py-2 overflow-hidden text-ellipsis focus:ring-rose focus:border-rose focus:outline-none"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />

        {/* Navigation row */}
        <div className="w-full flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigate('/build/arrange')}
            className="flex-1 border-2 border-rose text-rose font-note text-xs font-semibold py-2.5 px-4 rounded-lg hover:bg-rose-light transition-all duration-300"
          >
            BACK
          </button>
          <button
            onClick={() => handleLeaveAttempt('new')}
            className="flex-1 border-2 border-rose text-rose font-note text-xs font-semibold py-2.5 px-4 rounded-lg hover:bg-rose-light transition-all duration-300"
          >
            CREATE NEW
          </button>
          <button
            onClick={() => handleLeaveAttempt('garden')}
            className="flex-1 border-2 border-rose text-rose font-note text-xs font-semibold py-2.5 px-4 rounded-lg hover:bg-rose-light transition-all duration-300"
          >
            GO TO GARDEN
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
