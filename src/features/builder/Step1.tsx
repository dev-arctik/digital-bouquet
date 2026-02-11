// Step 1 — Flower selection.
// Left/center: 3x3 flower grid. Right: cart sidebar with integrated NEXT button.
// NEXT button enabled when at least 1 flower is in the cart.

import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { FlowerGrid } from './FlowerGrid';
import { Cart } from './Cart';

export const Step1: React.FC = () => {
  const navigate = useNavigate();
  const cart = useAppSelector((state) => state.builder.cart);

  // At least 1 flower required to proceed
  const hasFlowers = cart.length > 0;
  const totalCount = cart.reduce((sum, item) => sum + item.count, 0);

  const handleNext = () => {
    navigate('/build/arrange');
  };

  // Dynamic subtitle based on whether the user has filled the bouquet
  const subtitle =
    totalCount === 6
      ? "You've chosen 6 flowers — press Next to arrange your bouquet!"
      : 'Choose up to 6 flowers for your bouquet';

  return (
    <div className="flex flex-col items-center justify-center gap-3 min-h-[calc(100vh-64px)]">
      {/* Header — DM Sans for readability, matching home page style */}
      <div className="text-center animate-fade-in-up">
        <h2 className="font-note text-4xl sm:text-5xl font-bold">
          Pick Your Flowers
        </h2>
        <p className="text-sm text-subtitle font-note mt-2">
          {subtitle}
        </p>
      </div>

      {/* Main layout: grid + cart sidebar, centered */}
      <div className="flex gap-8 justify-center">
        <div className="flex-1">
          <FlowerGrid />
        </div>

        <div className="w-56 shrink-0">
          <Cart onNext={handleNext} hasFlowers={hasFlowers} />
        </div>
      </div>
    </div>
  );
};
