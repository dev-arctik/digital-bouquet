// Viewer page — displays a shared bouquet decoded from the URL.
// Shows loading, error, or success state depending on decode result.

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Plus, Flower2, Camera, Eye, X } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import type { Bouquet } from '../types';
import { BouquetPreview } from '../features/builder/BouquetPreview';
import { ShareActions } from '../features/share/ShareActions';
import { decodeBouquet } from '../features/share/decoder';
import { exportAsImage } from '../features/share/imageExport';
import { saveBouquet } from '../features/garden/gardenSlice';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../data/flowers';
import { hasStorageRoom } from '../utils/storage';

type ViewerState = 'loading' | 'error' | 'success';

// Check if a decoded bouquet matches one already in the garden by content
// (IDs are regenerated on decode, so we compare flower positions + note + greenery)
const bouquetsMatch = (a: Bouquet, b: Bouquet): boolean => {
  if (a.greenery !== b.greenery) return false;
  if (a.flowers.length !== b.flowers.length) return false;
  if ((a.note?.text ?? '') !== (b.note?.text ?? '')) return false;

  // Compare flowers by type + position (order-independent)
  const key = (f: { type: string; x: number; y: number }) => `${f.type}:${f.x}:${f.y}`;
  const aKeys = new Set(a.flowers.map(key));
  return b.flowers.every((f) => aKeys.has(key(f)));
};

const ViewerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const gardenBouquets = useAppSelector((state) => state.garden.bouquets);

  const previewRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [viewerState, setViewerState] = useState<ViewerState>('loading');
  const [bouquet, setBouquet] = useState<Bouquet | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  // Safe initial scale so 800px canvas doesn't inflate layout on first render
  const [scale, setScale] = useState(() =>
    typeof window !== 'undefined' ? Math.min(1, (window.innerWidth - 32) / CANVAS_WIDTH) : 1
  );

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

  // Decode the bouquet from the URL on mount
  useEffect(() => {
    const data = searchParams.get('d');

    if (!data) {
      setViewerState('error');
      return;
    }

    // Small delay so the loading state is visible (feels intentional)
    const timer = setTimeout(() => {
      const decoded = decodeBouquet(data);
      if (decoded) {
        setBouquet(decoded);
        setViewerState('success');
      } else {
        setViewerState('error');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchParams]);

  // Check if this bouquet already exists in the garden (by content match)
  const alreadyInGarden = useMemo(
    () => bouquet ? gardenBouquets.some((g) => bouquetsMatch(g, bouquet)) : false,
    [bouquet, gardenBouquets]
  );

  // Derived: true if just saved this session OR was already in garden on load
  const isSaved = justSaved || alreadyInGarden;

  // Modal shown when user tries to leave without saving
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Save the viewed bouquet to the garden
  const handleSaveToGarden = () => {
    if (!bouquet) return;

    if (!hasStorageRoom()) {
      showToast('STORAGE IS FULL. TRY DELETING OLD BOUQUETS FIRST.', 'error');
      return;
    }
    dispatch(saveBouquet(bouquet));
    setJustSaved(true);
    showToast('BOUQUET SAVED TO GARDEN!', 'saved');
  };

  // Save as photo from the modal
  const handleSaveAsPhoto = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      await exportAsImage(previewRef.current);
      setShowLeaveModal(false);
    } catch {
      showToast("COULDN'T SAVE THE IMAGE. TRY TAKING A SCREENSHOT INSTEAD.", 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // "Create Your Own Bouquet" — if not saved, show modal; otherwise navigate
  const handleCreateOwn = () => {
    if (isSaved) {
      navigate('/');
    } else {
      setShowLeaveModal(true);
    }
  };

  // Loading state
  if (viewerState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 animate-fade-in-up">
        <p className="font-note text-sm font-semibold animate-pulse text-rose">
          Unwrapping your bouquet...
        </p>
      </div>
    );
  }

  // Error state — invalid or missing data
  if (viewerState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 gap-6 animate-fade-in-up">
        <p className="font-note text-xl font-semibold">
          This bouquet link seems to be broken
        </p>
        <p className="font-note text-base text-subtitle">
          The link may be incomplete or corrupted.
        </p>
        <Link
          to="/"
          className="bg-rose text-white font-note text-sm font-semibold rounded-lg py-3 px-8 hover:bg-rose-dark hover:shadow-lg transition-all duration-300"
        >
          Create Your Own
        </Link>
      </div>
    );
  }

  // Success state — valid bouquet decoded
  return (
    <div className="max-w-5xl mx-auto px-4 py-4 flex-1 flex flex-col items-center justify-center gap-3 animate-fade-in-up w-full overflow-hidden">
      {/* Heading — warm, personal message */}
      <h1 className="font-logo text-3xl sm:text-4xl md:text-5xl font-bold text-rose-dark text-center px-2">
        You are special to me
      </h1>

      {/* Centered bouquet preview */}
      {bouquet && (
        <>
          <div ref={wrapperRef} className="w-full flex justify-center overflow-hidden">
            <div
              className="shadow-lg rounded-xl border border-rose-light overflow-hidden"
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

          {/* Actions below the preview, matched to canvas width */}
          <div className="w-full flex flex-col items-center gap-3" style={{ maxWidth: CANVAS_WIDTH * scale }}>
            {/* Primary CTA — create your own bouquet */}
            <button
              onClick={handleCreateOwn}
              className="w-full bg-coral text-white text-sm uppercase tracking-widest font-bold py-3 px-6 rounded-lg font-note hover:bg-[#E85A35] hover:shadow-md transition-all duration-200"
            >
              <Plus size={16} className="inline -mt-0.5" /> Create Your Own Bouquet
            </button>

            {/* Secondary: save actions */}
            <ShareActions
              bouquet={bouquet}
              previewRef={previewRef}
              onSaveToGarden={handleSaveToGarden}
              isSaved={isSaved}
              onViewGarden={() => navigate('/garden')}
              hideShareButton
            />
          </div>

          {/* Modal — prompt to save before leaving */}
          <Modal
            isOpen={showLeaveModal}
            onClose={() => setShowLeaveModal(false)}
            title="Before you go..."
          >
            <p className="font-note text-base text-center mb-6">
              Someone made this bouquet for you.<br />
              Won&apos;t you like to save it?
            </p>
            <div className="flex flex-col gap-2">
              {/* After saving: "Save to Garden" becomes "View Garden" */}
              <button
                onClick={() => {
                  if (isSaved) {
                    navigate('/garden');
                  } else {
                    handleSaveToGarden();
                  }
                }}
                className="w-full border border-rose text-rose text-xs uppercase tracking-wider font-semibold py-2.5 px-4 rounded-lg font-note hover:bg-rose-light transition-all duration-200"
              >
                {isSaved
                  ? <><Eye size={14} className="inline -mt-0.5" /> View Garden</>
                  : <><Flower2 size={14} className="inline -mt-0.5" /> Save to Garden</>
                }
              </button>

              <button
                onClick={handleSaveAsPhoto}
                disabled={isExporting}
                className={`w-full border text-xs uppercase tracking-wider font-semibold py-2.5 px-4 rounded-lg font-note transition-all duration-200 ${
                  isExporting
                    ? 'bg-disabled text-white border-disabled cursor-not-allowed'
                    : 'border-rose text-rose hover:bg-rose-light'
                }`}
              >
                {isExporting ? 'Saving...' : <><Camera size={14} className="inline -mt-0.5" /> Save as Photo</>}
              </button>

              {/* After saving: "No I don't want to save" becomes "Create Your Own Bouquet" */}
              <button
                onClick={() => {
                  setShowLeaveModal(false);
                  navigate('/');
                }}
                className="w-full text-subtitle text-xs uppercase tracking-wider font-semibold py-2.5 px-4 rounded-lg font-note hover:text-rose-dark transition-all duration-200"
              >
                {isSaved
                  ? <><Plus size={14} className="inline -mt-0.5" /> Create Your Own Bouquet</>
                  : <><X size={14} className="inline -mt-0.5" /> No, I don&apos;t want to save</>
                }
              </button>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default ViewerPage;
