// GreenerySelector — dropdown to pick a greenery background for the canvas.

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setGreenery } from './builderSlice';
import { GREENERY_OPTIONS } from '../../data/flowers';
import type { GreeneryType } from '../../types';

export const GreenerySelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const greenery = useAppSelector((state) => state.builder.greenery);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setGreenery(e.target.value as GreeneryType));
  };

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="greenery-select"
        className="font-note text-sm font-semibold text-rose-dark"
      >
        Greenery
      </label>
      <select
        id="greenery-select"
        value={greenery}
        onChange={handleChange}
        className="border border-rose-light rounded-lg bg-white px-3 py-2 font-note text-sm appearance-none cursor-pointer focus:ring-rose focus:outline-none"
      >
        {GREENERY_OPTIONS.map((option) => (
          <option key={option.type} value={option.type}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};
