// Image export — captures a DOM element as a JPEG and triggers download.
// Uses html-to-image for rasterization.
// Captures at full 800x600 even if the element is CSS-scaled down.
// JPEG format includes the cream background so bouquets look complete everywhere.

import { toJpeg } from 'html-to-image';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../data/flowers';

// Soft warm cream — lighter than the note card, not plain white
const BACKGROUND_COLOR = '#FFFBF5';

export async function exportAsImage(element: HTMLElement): Promise<void> {
  // Override width/height and remove CSS transforms so scaled-down
  // previews (e.g. in garden modal) export at full resolution.
  const dataUrl = await toJpeg(element, {
    cacheBust: true,
    quality: 0.95,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: BACKGROUND_COLOR,
    style: {
      transform: 'none',
      width: `${CANVAS_WIDTH}px`,
      height: `${CANVAS_HEIGHT}px`,
    },
  });

  const link = document.createElement('a');
  link.download = 'my-bouquet.jpg';
  link.href = dataUrl;
  link.click();
}
