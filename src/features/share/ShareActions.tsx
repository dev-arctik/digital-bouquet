// ShareActions — reusable action buttons for sharing, saving as photo,
// and saving to garden. Used by both Step3 and ViewerPage.

import { useState } from 'react';
import { Share2, Camera, Flower2, Eye } from 'lucide-react';

import type { Bouquet } from '../../types';
import { useToast } from '../../components/Toast';
import { generateShareLink } from './generateShareLink';
import { exportAsImage } from './imageExport';

interface ShareActionsProps {
  bouquet: Bouquet;
  previewRef: React.RefObject<HTMLDivElement | null>;
  onSaveToGarden?: () => void;
  isSaved?: boolean;
  onViewGarden?: () => void;  // navigate to garden after saving
  hideShareButton?: boolean;  // viewer page has its own primary CTA
}

export const ShareActions: React.FC<ShareActionsProps> = ({
  bouquet,
  previewRef,
  onSaveToGarden,
  isSaved = false,
  onViewGarden,
  hideShareButton = false,
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
    <div className="flex flex-col gap-2 w-full">
      {/* Primary: share — full width, solid coral, most prominent */}
      {!hideShareButton && (
        <button
          onClick={handleShare}
          className="w-full bg-coral text-white text-sm uppercase tracking-widest font-bold py-3 px-6 rounded-lg font-note hover:bg-[#E85A35] hover:shadow-md transition-all duration-200"
        >
          <Share2 size={16} className="inline -mt-0.5" /> Share Your Bouquet
        </button>
      )}

      {/* Secondary: save actions — side by side, smaller, outlined */}
      <div className="flex gap-2 w-full">
        <button
          onClick={handleSaveAsPhoto}
          disabled={isExporting}
          className={`flex-1 border text-xs uppercase tracking-wider font-semibold py-2 px-4 rounded-lg font-note transition-all duration-200 ${
            isExporting
              ? 'bg-disabled text-white border-disabled cursor-not-allowed'
              : 'border-rose text-rose hover:bg-rose-light'
          }`}
        >
          {isExporting ? 'Saving...' : <><Camera size={14} className="inline -mt-0.5" /> Save as Photo</>}
        </button>

        {/* Save to garden — toggles to "View Garden" after saving */}
        {onSaveToGarden && (
          <button
            onClick={isSaved ? onViewGarden : onSaveToGarden}
            className="flex-1 border border-rose text-rose text-xs uppercase tracking-wider font-semibold py-2 px-4 rounded-lg font-note hover:bg-rose-light transition-all duration-200"
          >
            {isSaved ? <><Eye size={14} className="inline -mt-0.5" /> View Garden</> : <><Flower2 size={14} className="inline -mt-0.5" /> Save to Garden</>}
          </button>
        )}
      </div>
    </div>
  );
};
