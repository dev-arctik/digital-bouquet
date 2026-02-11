// Image export — captures a DOM element as a PNG and triggers download.
// Uses html-to-image for rasterization.
// Captures at full 800x600 even if the element is CSS-scaled down.

import { toPng } from 'html-to-image';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../data/flowers';

export async function exportAsImage(element: HTMLElement): Promise<void> {
  // Override width/height and remove CSS transforms so scaled-down
  // previews (e.g. in garden modal) export at full resolution.
  // Transparent background so the PNG composites cleanly over any surface.
  const dataUrl = await toPng(element, {
    cacheBust: true,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: 'transparent',
    style: {
      transform: 'none',
      width: `${CANVAS_WIDTH}px`,
      height: `${CANVAS_HEIGHT}px`,
      backgroundColor: 'transparent',
    },
  });

  const link = document.createElement('a');
  link.download = 'my-bouquet.png';
  link.href = dataUrl;
  link.click();
}
