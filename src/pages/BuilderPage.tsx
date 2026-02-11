// Builder page — 3-step wizard layout container.
// Each step renders via nested routes (/build/pick, /build/arrange, /build/preview).
// Registers beforeunload when placedFlowers has items (unsaved work protection).

import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

// Step labels for the progress indicator
const STEPS = ['PICK FLOWERS', 'ARRANGE', 'PREVIEW'] as const;

// Inline step indicator — dots connected by lines with color states:
// completed = green, current = coral with ring, upcoming = gray
const StepIndicator: React.FC<{ currentStep: 1 | 2 | 3 }> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const stepNumber = (i + 1) as 1 | 2 | 3;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        // Dot color: green if done, rose if active, gray if upcoming
        const dotClass = isCompleted
          ? 'bg-leaf-green'
          : isCurrent
            ? 'bg-rose ring-2 ring-rose ring-offset-2 ring-offset-cream'
            : 'bg-stone-gray';

        // Label color follows the same pattern
        const labelClass = isCompleted
          ? 'text-leaf-green'
          : isCurrent
            ? 'text-rose'
            : 'text-stone-gray';

        return (
          <div key={label} className="flex items-center">
            {/* Connector line before this step (skip for the first dot) */}
            {i > 0 && (
              <div
                className={`w-16 h-[2px] sm:w-24 ${
                  isCompleted || isCurrent ? 'bg-rose' : 'bg-stone-gray'
                }`}
              />
            )}

            {/* Dot + label stack */}
            <div className="flex flex-col items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${dotClass}`} />
              <span className={`font-note text-[11px] font-semibold whitespace-nowrap ${labelClass}`}>
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Map route pathname to step number — route is the source of truth
const STEP_BY_PATH: Record<string, 1 | 2 | 3> = {
  '/build/pick': 1,
  '/build/arrange': 2,
  '/build/preview': 3,
};

const BuilderPage: React.FC = () => {
  const { pathname } = useLocation();
  const step = STEP_BY_PATH[pathname] ?? 1;
  const hasPlacedFlowers = useAppSelector(
    (state) => state.builder.placedFlowers.length > 0
  );

  // Warn before browser navigation (refresh/close) when unsaved work exists
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPlacedFlowers) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasPlacedFlowers]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-fade-in-up">
      <StepIndicator currentStep={step} />
      <Outlet />
    </div>
  );
};

export default BuilderPage;
