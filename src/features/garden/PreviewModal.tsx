// PreviewModal — full preview of a saved bouquet with action buttons.
// Opens when a BouquetCard is clicked in the garden grid.
// Provides edit, share, download, and delete actions.

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Share2, Camera, Trash2 } from 'lucide-react';
import { useAppDispatch } from '../../app/hooks';
import { useToast } from '../../components/Toast';
import { Modal } from '../../components/Modal';
import { BouquetPreview } from '../builder/BouquetPreview';
import { loadBouquetForEditing } from '../builder/builderSlice';
import { deleteBouquet } from './gardenSlice';
import { exportAsImage } from '../share/imageExport';
import { generateShareLink } from '../share/generateShareLink';
import type { Bouquet } from '../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../data/flowers';

interface PreviewModalProps {
  bouquet: Bouquet | null;
  onClose: () => void;
}

// Scale the 800x600 preview to fit the modal's max width (~448px content area)
const PREVIEW_SCALE = 0.55;
const SCALED_WIDTH = CANVAS_WIDTH * PREVIEW_SCALE;
const SCALED_HEIGHT = CANVAS_HEIGHT * PREVIEW_SCALE;

// How long the "CONFIRM DELETE?" state stays active before resetting
const DELETE_CONFIRM_TIMEOUT_MS = 3000;

// Format ISO date string into a human-readable date
const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const PreviewModal: React.FC<PreviewModalProps> = ({
  bouquet,
  onClose,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const previewRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset delete confirmation state when modal closes or bouquet changes
  useEffect(() => {
    setIsConfirmingDelete(false);
    setIsSaving(false);
    if (confirmTimerRef.current) {
      clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = null;
    }
  }, [bouquet]);

  // Clean up the confirmation timer on unmount
  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    };
  }, []);

  const handleEdit = useCallback(() => {
    if (!bouquet) return;
    dispatch(loadBouquetForEditing(bouquet));
    onClose();
    navigate('/build/arrange');
  }, [bouquet, dispatch, navigate, onClose]);

  const handleSaveAsPhoto = useCallback(async () => {
    if (!previewRef.current) return;
    setIsSaving(true);
    try {
      await exportAsImage(previewRef.current);
      showToast('PHOTO SAVED', 'saved');
    } catch {
      showToast('FAILED TO SAVE PHOTO', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  const handleShareLink = useCallback(async () => {
    if (!bouquet) return;
    const link = generateShareLink(bouquet);

    try {
      // Prefer native share sheet (mobile), fall back to clipboard
      if (navigator.share) {
        await navigator.share({
          title: 'A bouquet for you!',
          text: 'Someone made a digital bouquet for you',
          url: link,
        });
        return;
      }
      await navigator.clipboard.writeText(link);
      showToast('LINK COPIED!', 'success');
    } catch (err) {
      // User cancelled the share dialog — not an error
      if (err instanceof Error && err.name === 'AbortError') return;
      showToast('FAILED TO COPY LINK', 'error');
    }
  }, [bouquet, showToast]);

  const handleDelete = useCallback(() => {
    if (!bouquet) return;

    if (!isConfirmingDelete) {
      // First click: enter confirmation state with auto-reset timer
      setIsConfirmingDelete(true);
      confirmTimerRef.current = setTimeout(() => {
        setIsConfirmingDelete(false);
        confirmTimerRef.current = null;
      }, DELETE_CONFIRM_TIMEOUT_MS);
      return;
    }

    // Second click: actually delete
    if (confirmTimerRef.current) {
      clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = null;
    }
    dispatch(deleteBouquet(bouquet.id));
    onClose();
  }, [bouquet, isConfirmingDelete, dispatch, onClose]);

  // Reset delete confirmation when any other button is clicked
  const resetDeleteConfirm = useCallback(() => {
    if (isConfirmingDelete) {
      setIsConfirmingDelete(false);
      if (confirmTimerRef.current) {
        clearTimeout(confirmTimerRef.current);
        confirmTimerRef.current = null;
      }
    }
  }, [isConfirmingDelete]);

  return (
    <Modal isOpen={bouquet !== null} onClose={onClose} title="BOUQUET PREVIEW">
      {bouquet && (
        <div className="flex flex-col items-center gap-4">
          {/* Scaled BouquetPreview with note visible */}
          <div
            className="shadow-lg rounded-xl border border-rose-light overflow-hidden"
            style={{ width: SCALED_WIDTH, height: SCALED_HEIGHT }}
          >
            <div
              style={{
                transform: `scale(${PREVIEW_SCALE})`,
                transformOrigin: 'top left',
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
              }}
            >
              <BouquetPreview
                ref={previewRef}
                flowers={bouquet.flowers}
                note={bouquet.note}
                greenery={bouquet.greenery}
                showNote={true}
              />
            </div>
          </div>

          {/* Creation date */}
          <p className="font-note text-xs text-subtitle">
            Created {formatDate(bouquet.createdAt)}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col w-full gap-2">
            {/* Primary: Edit */}
            <button
              className="w-full py-2.5 bg-rose text-white font-note text-sm font-semibold rounded-lg hover:bg-rose-dark hover:shadow-md transition-all duration-300"
              onClick={() => {
                resetDeleteConfirm();
                handleEdit();
              }}
            >
              <Pencil size={14} className="inline -mt-0.5" /> Edit
            </button>

            {/* Secondary: Share Link (before photo — sharing is the more common action) */}
            <button
              className="w-full py-2.5 border-2 border-rose text-rose font-note text-sm font-semibold rounded-lg hover:bg-rose-light transition-all duration-300"
              onClick={() => {
                resetDeleteConfirm();
                handleShareLink();
              }}
            >
              <Share2 size={14} className="inline -mt-0.5" /> Share Link
            </button>

            {/* Secondary: Save as Photo */}
            <button
              className={`w-full py-2.5 border-2 font-note text-sm font-semibold rounded-lg transition-all duration-300 ${
                isSaving
                  ? 'border-disabled bg-disabled text-white cursor-not-allowed'
                  : 'border-rose text-rose hover:bg-rose-light'
              }`}
              onClick={() => {
                resetDeleteConfirm();
                handleSaveAsPhoto();
              }}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : <><Camera size={14} className="inline -mt-0.5" /> Save as Photo</>}
            </button>

            {/* Tertiary: Delete — two-click confirmation, coral for destructive action */}
            <button
              className="w-full py-2 text-coral font-note text-sm font-semibold underline hover:text-[#E85A35] transition-all duration-300"
              onClick={handleDelete}
            >
              <Trash2 size={14} className="inline -mt-0.5" /> {isConfirmingDelete ? 'Confirm Delete?' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
