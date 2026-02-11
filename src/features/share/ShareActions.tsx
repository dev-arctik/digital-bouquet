// ShareActions — reusable action buttons for sharing, saving as photo,
// and saving to garden. Used by both Step3 and ViewerPage.

import { useState } from 'react';

import type { Bouquet } from '../../types';
import { useToast } from '../../components/Toast';
import { generateShareLink } from './generateShareLink';
import { exportAsImage } from './imageExport';

interface ShareActionsProps {
  bouquet: Bouquet;
  previewRef: React.RefObject<HTMLDivElement | null>;
  onSaveToGarden?: () => void;
  isSaved?: boolean;
}

export const ShareActions: React.FC<ShareActionsProps> = ({
  bouquet,
  previewRef,
  onSaveToGarden,
  isSaved = false,
}) => {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // Share via Web Share API, fall back to clipboard copy
  const handleShare = async () => {
    const link = generateShareLink(bouquet);

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'A bouquet for you!',
          url: link,
        });
      } else {
        await navigator.clipboard.writeText(link);
        showToast('LINK COPIED!', 'info');
      }
    } catch (error) {
      // User cancelled share dialog — not an error worth showing.
      // But if clipboard also fails, copy the link manually.
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        try {
          await navigator.clipboard.writeText(link);
          showToast('LINK COPIED!', 'info');
        } catch {
          showToast('COULD NOT SHARE. TRY COPYING THE LINK MANUALLY.', 'error');
        }
      }
    }
  };

  // Export the preview element as a PNG image
  const handleSaveAsPhoto = async () => {
    if (!previewRef.current) return;

    setIsExporting(true);
    try {
      await exportAsImage(previewRef.current);
    } catch {
      showToast(
        "COULDN'T SAVE THE IMAGE. TRY TAKING A SCREENSHOT INSTEAD.",
        'error'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      {/* Primary share button — coral for attention */}
      <button
        onClick={handleShare}
        className="flex-1 bg-coral text-white text-xs uppercase tracking-widest font-bold py-3 px-6 rounded-lg font-note font-semibold hover:bg-[#E85A35] transition-all duration-200"
      >
        SHARE
      </button>

      {/* Secondary: save as photo — rose outline */}
      <button
        onClick={handleSaveAsPhoto}
        disabled={isExporting}
        className={`flex-1 border-2 text-xs uppercase tracking-widest font-bold py-3 px-6 rounded-lg font-note font-semibold transition-all duration-200 ${
          isExporting
            ? 'bg-disabled text-white border-disabled cursor-not-allowed rounded-lg'
            : 'border-rose text-rose hover:bg-rose-light'
        }`}
      >
        {isExporting ? 'SAVING...' : 'SAVE AS PHOTO'}
      </button>

      {/* Secondary: save to garden — rose outline (optional, hidden if no handler) */}
      {onSaveToGarden && (
        <button
          onClick={onSaveToGarden}
          disabled={isSaved}
          className={`flex-1 border-2 text-xs uppercase tracking-widest font-bold py-3 px-6 rounded-lg font-note font-semibold transition-all duration-200 ${
            isSaved
              ? 'bg-disabled text-white border-disabled cursor-not-allowed rounded-lg'
              : 'border-rose text-rose hover:bg-rose-light'
          }`}
        >
          {isSaved ? 'SAVED!' : 'SAVE TO GARDEN'}
        </button>
      )}
    </div>
  );
};
