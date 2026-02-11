// Step 1 — Flower selection.
// Left/center: 3x3 flower grid. Right: cart sidebar.
// NEXT button enabled when at least 1 flower is in the cart.

import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { StepNavigation } from '../../components/StepNavigation';
import { FlowerGrid } from './FlowerGrid';
import { Cart } from './Cart';

export const Step1: React.FC = () => {
  const navigate = useNavigate();
  const cart = useAppSelector((state) => state.builder.cart);

  // At least 1 flower required to proceed
  const hasFlowers = cart.length > 0;

  const handleNext = () => {
    navigate('/build/arrange');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header — script font for warmth */}
      <div className="text-center animate-fade-in-up">
        <h2 className="font-logo text-4xl sm:text-5xl">
          Pick Your Flowers
        </h2>
        <p className="text-sm text-subtitle font-note mt-2">
          Choose up to 6 flowers for your bouquet
        </p>
      </div>

      {/* Main layout: grid + cart sidebar */}
      <div className="flex gap-8">
        <div className="flex-1">
          <FlowerGrid />
        </div>

        <div className="w-56 shrink-0">
          <Cart />
        </div>
      </div>

      {/* No BACK on step 1 — only NEXT */}
      <StepNavigation onNext={handleNext} nextDisabled={!hasFlowers} />
    </div>
  );
};
