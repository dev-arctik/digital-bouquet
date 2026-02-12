// Step 3 — Preview & Share.
// Shows a read-only bouquet preview with share, save, and export actions.
// Handles unsaved-work warnings when navigating away.

import { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';

import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { useToast } from '../../components/Toast';
import type { Bouquet } from '../../types';
import { resetBuilder, markSaved } from './builderSlice';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const builder = useAppSelector((state) => state.builder);
  const gardenBouquets = useAppSelector((state) => state.garden.bouquets);

  const previewRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isSavedInRedux = useAppSelector((state) => state.builder.isSavedToGarden);
  const [leaveTarget, setLeaveTarget] = useState<LeaveTarget>(null);
  // Safe initial scale so 800px canvas doesn't inflate layout on first render
  const [scale, setScale] = useState(() =>
    typeof window !== 'undefined' ? Math.min(1, (window.innerWidth - 32) / CANVAS_WIDTH) : 1
  );

  // On refresh after saving, builder state is gone but bouquet is in garden.
  // If URL has ?saved=<id>, recover the bouquet from garden instead of redirecting home.
  const savedId = searchParams.get('saved');
  const gardenBouquet = savedId ? gardenBouquets.find((b) => b.id === savedId) : null;

  // Recovered from garden = already saved; otherwise check Redux flag
  const isSaved = isSavedInRedux || !!gardenBouquet;

  // Redirect to home only if no flowers AND no recoverable saved bouquet
  const hasNoFlowers = builder.placedFlowers.length === 0 && !gardenBouquet;
  useEffect(() => {
    if (hasNoFlowers) {
      navigate('/', { replace: true });
    }
  }, [hasNoFlowers, navigate]);

  // Responsive scaling — fit preview within available width AND viewport height
  useEffect(() => {
    const updateScale = () => {
      const maxAvailableWidth = window.innerWidth - 32;
      const wrapperWidth = Math.min(
        wrapperRef.current?.clientWidth ?? maxAvailableWidth,
        maxAvailableWidth
      );
      const maxPreviewHeight = window.innerHeight * 0.50;
      setScale(Math.min(1, wrapperWidth / CANVAS_WIDTH, maxPreviewHeight / CANVAS_HEIGHT));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Don't render anything while redirecting — placed after all hooks
  if (hasNoFlowers) return null;

  // Stable ID: generated once per mount, so BACK+NEXT doesn't create duplicates
  const [bouquetId] = useState(
    () => gardenBouquet?.id ?? builder.editingBouquetId ?? crypto.randomUUID()
  );
  const [createdAt] = useState(
    () => gardenBouquet?.createdAt ?? new Date().toISOString()
  );

  // Build the Bouquet object — use garden bouquet if recovering from refresh, else builder state
  const bouquet: Bouquet = useMemo(
    () => gardenBouquet ?? {
      id: bouquetId,
      flowers: builder.placedFlowers,
      note: builder.note,
      greenery: builder.greenery,
      canvasWidth: builder.canvasWidth,
      canvasHeight: builder.canvasHeight,
      createdAt,
    },
    [
      gardenBouquet,
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
    dispatch(markSaved());
    // Persist bouquet ID in URL so refresh can recover from garden
    setSearchParams({ saved: bouquet.id }, { replace: true });
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
    <div className="flex-1 flex flex-col items-center justify-center gap-2 animate-fade-in-up w-full overflow-hidden">
      {/* Title */}
      <h2 className="font-note text-2xl sm:text-4xl md:text-5xl text-center font-bold px-2">
        Preview & Share
      </h2>

      {/* Centered bouquet preview */}
      <div ref={wrapperRef} className="w-full flex justify-center overflow-hidden">
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
