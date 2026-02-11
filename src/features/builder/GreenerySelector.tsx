// GreenerySelector — custom dropdown (not native <select>) to pick greenery.
// Styled to match the "Add a Custom Note" button for visual consistency.

import { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setGreenery } from './builderSlice';
import { GREENERY_OPTIONS } from '../../data/flowers';
import type { GreeneryType } from '../../types';

export const GreenerySelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const greenery = useAppSelector((state) => state.builder.greenery);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Current selection label
  const currentLabel =
    GREENERY_OPTIONS.find((g) => g.type === greenery)?.name ?? 'None';

  const handleSelect = (type: GreeneryType) => {
    dispatch(setGreenery(type));
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger button — matches "Add a Custom Note" style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-2.5 border-2 border-rose text-rose rounded-lg font-note text-sm font-semibold hover:bg-rose-light transition-all duration-300 flex items-center gap-2"
      >
        {currentLabel}
        <span className="text-[10px]">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown menu — opens upward to avoid being clipped at page bottom */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-1 w-full bg-white border-2 border-rose rounded-lg shadow-lg overflow-hidden z-50">
          {GREENERY_OPTIONS.map((option) => (
            <button
              key={option.type}
              onClick={() => handleSelect(option.type)}
              className={`w-full text-left px-4 py-2.5 font-note text-sm transition-colors duration-150 ${
                option.type === greenery
                  ? 'bg-rose-light text-rose-dark font-semibold'
                  : 'text-rose hover:bg-rose-light'
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
