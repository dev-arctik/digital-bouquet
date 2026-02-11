// Sidebar cart for step 1 — shows selected flowers with +/- controls.
// Displays each flower type's count and a total counter at the bottom.

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { incrementCartItem, decrementCartItem } from './builderSlice';
import { FLOWERS, MAX_FLOWERS } from '../../data/flowers';

export const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.builder.cart);

  const totalCount = cart.reduce((sum, item) => sum + item.count, 0);
  const isAtMax = totalCount >= MAX_FLOWERS;

  return (
    <div className="flex flex-col gap-4" aria-label="Your bouquet cart">
      <h3 className="font-logo text-2xl text-rose-dark">Your Bouquet</h3>

      {/* Empty state */}
      {cart.length === 0 && (
        <p className="text-sm text-subtitle font-note">
          No flowers selected yet
        </p>
      )}

      {/* Cart item list */}
      <ul className="flex flex-col gap-3">
        {cart.map((item) => {
          // Look up display name from the catalog
          const meta = FLOWERS.find((f) => f.type === item.type);
          const name = meta?.name ?? item.type;

          return (
            <li key={item.type} className="flex items-center justify-between px-2 py-1 -mx-2 rounded-lg hover:bg-rose-light transition-colors duration-150">
              <span className="text-sm font-note">
                {name}
              </span>

              <div className="flex items-center gap-2">
                {/* Decrement — removes item entirely at 0 */}
                <button
                  onClick={() => dispatch(decrementCartItem(item.type))}
                  aria-label={`Remove one ${name}`}
                  className="w-7 h-7 flex items-center justify-center border-2 border-rose text-rose text-xs font-bold rounded-lg hover:bg-rose hover:text-white transition-all duration-200"
                >
                  -
                </button>

                <span className="w-5 text-center text-xs font-bold">
                  {item.count}
                </span>

                {/* Increment — disabled when cart is full */}
                <button
                  onClick={() => dispatch(incrementCartItem(item.type))}
                  disabled={isAtMax}
                  aria-label={`Add one more ${name}`}
                  className={`w-7 h-7 flex items-center justify-center border-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                    isAtMax
                      ? 'border-disabled text-disabled cursor-not-allowed'
                      : 'border-rose text-rose hover:bg-rose hover:text-white'
                  }`}
                >
                  +
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Total counter with pill badge */}
      <div className="border-t border-rose-light pt-3 mt-auto flex items-center gap-2">
        {/* Warm rose pill badge showing flower count */}
        <span className="inline-flex items-center justify-center bg-rose text-white text-xs font-bold rounded-full w-7 h-7">
          {totalCount}
        </span>
        <span className="text-sm font-note font-medium">
          / {MAX_FLOWERS} Flowers
        </span>
      </div>
    </div>
  );
};
