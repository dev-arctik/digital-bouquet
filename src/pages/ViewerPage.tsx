// Viewer page — displays a shared bouquet decoded from the URL.
// Shows loading, error, or success state depending on decode result.

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

import { useAppDispatch } from '../app/hooks';
import { useToast } from '../components/Toast';
import type { Bouquet } from '../types';
import { BouquetPreview } from '../features/builder/BouquetPreview';
import { ShareActions } from '../features/share/ShareActions';
import { decodeBouquet } from '../features/share/decoder';
import { saveBouquet } from '../features/garden/gardenSlice';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../data/flowers';
import { hasStorageRoom } from '../utils/storage';

type ViewerState = 'loading' | 'error' | 'success';

const ViewerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const previewRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [viewerState, setViewerState] = useState<ViewerState>('loading');
  const [bouquet, setBouquet] = useState<Bouquet | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [scale, setScale] = useState(1);

  // Responsive scaling — fit preview within available width AND viewport height
  useEffect(() => {
    const updateScale = () => {
      if (wrapperRef.current) {
        const widthScale = wrapperRef.current.clientWidth / CANVAS_WIDTH;
        const maxPreviewHeight = window.innerHeight * 0.55;
        const heightScale = maxPreviewHeight / CANVAS_HEIGHT;
        setScale(Math.min(1, widthScale, heightScale));
      }
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

  // Save the viewed bouquet to the garden
  const handleSaveToGarden = () => {
    if (!bouquet) return;

    if (!hasStorageRoom()) {
      showToast('STORAGE IS FULL. TRY DELETING OLD BOUQUETS FIRST.', 'error');
      return;
    }
    dispatch(saveBouquet(bouquet));
    setIsSaved(true);
    showToast('BOUQUET SAVED TO GARDEN!', 'saved');
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
    <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col items-center gap-3 animate-fade-in-up">
      {/* Heading — warm script font for a personal touch */}
      <h1 className="font-logo text-3xl sm:text-4xl text-rose-dark text-center">
        Someone made this for you!
      </h1>

      {/* Centered bouquet preview */}
      {bouquet && (
        <>
          <div ref={wrapperRef} className="w-full flex justify-center">
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
            <ShareActions
              bouquet={bouquet}
              previewRef={previewRef}
              onSaveToGarden={handleSaveToGarden}
              isSaved={isSaved}
            />
            <Link
              to="/"
              className="text-rose font-note text-sm font-semibold underline hover:text-rose-dark transition-all duration-300 text-center"
            >
              Create Your Own Bouquet
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewerPage;
