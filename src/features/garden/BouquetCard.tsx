// BouquetCard — thumbnail card for a single garden bouquet.
// Uses IntersectionObserver to lazily render the BouquetPreview only
// when the card scrolls into view, improving performance for large gardens.

import { useState, useEffect, useRef } from 'react';
import type { Bouquet } from '../../types';
import { BouquetPreview } from '../builder/BouquetPreview';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../data/flowers';

interface BouquetCardProps {
  bouquet: Bouquet;
  onClick: () => void;
}

// Scale factor to shrink the 800x600 canvas into a card-sized thumbnail
const THUMBNAIL_SCALE = 0.25;
const THUMBNAIL_WIDTH = CANVAS_WIDTH * THUMBNAIL_SCALE;
const THUMBNAIL_HEIGHT = CANVAS_HEIGHT * THUMBNAIL_SCALE;

export const BouquetCard: React.FC<BouquetCardProps> = ({
  bouquet,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Lazy render: only mount BouquetPreview once the card enters the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="border border-rose-light rounded-xl cursor-pointer relative overflow-hidden hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300"
      style={{ width: THUMBNAIL_WIDTH, height: THUMBNAIL_HEIGHT }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isVisible ? (
        // Scaled-down BouquetPreview — render at full size, shrink with CSS transform
        <div
          style={{ width: THUMBNAIL_WIDTH, height: THUMBNAIL_HEIGHT }}
        >
          <div
            style={{
              transform: `scale(${THUMBNAIL_SCALE})`,
              transformOrigin: 'top left',
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
            }}
          >
            <BouquetPreview
              flowers={bouquet.flowers}
              note={bouquet.note}
              greenery={bouquet.greenery}
              showNote={false}
            />
          </div>
        </div>
      ) : (
        // Placeholder shown before the card enters the viewport
        <div
          className="bg-cream"
          style={{ width: THUMBNAIL_WIDTH, height: THUMBNAIL_HEIGHT }}
        />
      )}

      {/* Hover overlay — warm rose tint */}
      <div
        className={`absolute inset-0 bg-rose/20 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="font-note text-xs font-semibold text-white">
          Preview
        </span>
      </div>
    </div>
  );
};
