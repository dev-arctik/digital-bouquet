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

      {/* Main layout: stacked on mobile, side-by-side on desktop */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center w-full px-4 md:px-0">
        <div className="w-full md:flex-1 max-w-sm mx-auto md:mx-0">
          <FlowerGrid />
        </div>

        <div className="w-full md:w-56 md:shrink-0 max-w-sm mx-auto md:mx-0">
          <Cart onNext={handleNext} hasFlowers={hasFlowers} />
        </div>
      </div>
    </div>
  );
};
