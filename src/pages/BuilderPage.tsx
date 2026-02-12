// Builder page — 3-step wizard layout container.
// Each step renders via nested routes (/build/pick, /build/arrange, /build/preview).
// Registers beforeunload when placedFlowers has items (unsaved work protection).
// Step titles within each step component provide enough context — no progress indicator needed.

import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

const BuilderPage: React.FC = () => {
  const hasPlacedFlowers = useAppSelector(
    (state) => state.builder.placedFlowers.length > 0
  );
  const isSaved = useAppSelector((state) => state.builder.isSavedToGarden);

  // Warn before browser navigation (refresh/close) only when unsaved work exists
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPlacedFlowers && !isSaved) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasPlacedFlowers, isSaved]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-3 animate-fade-in-up overflow-hidden flex-1 flex flex-col">
      <Outlet />
    </div>
  );
};

export default BuilderPage;
