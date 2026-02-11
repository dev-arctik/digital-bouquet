// Reusable modal overlay component.
// Renders via portal to document.body so it covers the ENTIRE viewport
// including the navbar. Light backdrop blur with soft overlay.

import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll while modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Close when clicking the backdrop (outside the content box)
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Portal to body so the overlay covers everything (navbar included)
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={contentRef}
        className="bg-white border border-rose-light rounded-2xl shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto animate-fade-in-up"
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Dialog'}
      >
        {/* Colored accent line at the top for branding */}
        <div className="h-0.5 bg-rose w-full" />

        {/* Header with optional title and close button */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            {title && (
              <h2 className="text-sm uppercase tracking-widest font-bold">
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              className="text-rose-dark text-xl leading-none hover:text-rose transition-colors ml-auto"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
