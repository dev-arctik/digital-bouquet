// BouquetCard — thumbnail card for a single garden bouquet.
// Uses IntersectionObserver to lazily render the BouquetPreview only
// when the card scrolls into view, improving performance for large gardens.
// Width is responsive — fills its grid cell, scale computed dynamically.

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Bouquet } from '../../types';
import { BouquetPreview } from '../builder/BouquetPreview';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../data/flowers';

interface BouquetCardProps {
  bouquet: Bouquet;
  onClick: () => void;
}

// Canvas aspect ratio — height = width * ASPECT
const ASPECT = CANVAS_HEIGHT / CANVAS_WIDTH;

export const BouquetCard: React.FC<BouquetCardProps> = ({
  bouquet,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  // Track the card's actual width so we can compute scale dynamically
  const [cardWidth, setCardWidth] = useState(0);

  const scale = cardWidth > 0 ? cardWidth / CANVAS_WIDTH : 0;
  const cardHeight = cardWidth * ASPECT;

  // Measure card width on mount + resize via ResizeObserver
  const measureWidth = useCallback(() => {
    if (cardRef.current) {
      setCardWidth(cardRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    measureWidth();
    const observer = new ResizeObserver(measureWidth);
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [measureWidth]);

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
      className="w-full border border-rose-light rounded-xl cursor-pointer relative overflow-hidden hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300"
      style={{ height: cardHeight || 'auto' }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isVisible && scale > 0 ? (
        // Scaled-down BouquetPreview — render at full 800x600, shrink with CSS transform
        <div style={{ width: cardWidth, height: cardHeight, overflow: 'hidden' }}>
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
            }}
          >
            <BouquetPreview
              flowers={bouquet.flowers}
              note={bouquet.note}
              greenery={bouquet.greenery}
            />
          </div>
        </div>
      ) : (
        // Placeholder shown before the card enters the viewport
        <div
          className="bg-cream w-full"
          style={{ height: cardHeight || 200 }}
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
