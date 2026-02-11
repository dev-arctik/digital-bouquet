// BACK / NEXT navigation buttons used across wizard steps.
// Primary button style for NEXT (solid rose), secondary (outlined rose) for BACK.
// All buttons: rounded-lg, monospace uppercase, letter-spacing.

import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StepNavigationProps {
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  backDisabled?: boolean;
  nextLabel?: string;
  backLabel?: string;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  onBack,
  onNext,
  nextDisabled = false,
  backDisabled = false,
  nextLabel = 'NEXT',
  backLabel = 'BACK',
}) => {
  return (
    <div className="flex items-center justify-between gap-4 mt-3">
      {/* BACK button — secondary style (outlined) */}
      {onBack ? (
        <button
          onClick={onBack}
          disabled={backDisabled}
          className={`px-6 py-3 text-xs uppercase tracking-widest font-bold border-2 rounded-lg transition-all duration-200 ${
            backDisabled
              ? 'border-disabled text-disabled cursor-not-allowed'
              : 'border-rose text-rose hover:bg-rose-light'
          }`}
        >
          <ArrowLeft size={14} className="inline -mt-0.5" /> {backLabel}
        </button>
      ) : (
        // Spacer so NEXT stays right-aligned when there is no BACK button
        <div />
      )}

      {/* NEXT button — primary style (solid) */}
      {onNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className={`px-6 py-3 text-xs uppercase tracking-widest font-bold rounded-lg transition-all duration-200 ${
            nextDisabled
              ? 'bg-disabled text-white cursor-not-allowed'
              : 'bg-rose text-white hover:bg-rose-dark'
          }`}
        >
          {nextLabel} <ArrowRight size={14} className="inline -mt-0.5" />
        </button>
      )}
    </div>
  );
};
