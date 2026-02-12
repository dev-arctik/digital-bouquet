// Share link generator — creates a full URL with compressed bouquet data.
// The entire bouquet state is encoded in the `d` query parameter.

import type { Bouquet } from '../../types';
import { encodeBouquet } from './encoder';

export function generateShareLink(bouquet: Bouquet): string {
  const encoded = encodeBouquet(bouquet);
  // BASE_URL includes trailing slash (e.g. '/digital-bouquet/' or '/')
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${window.location.origin}${base}/view?d=${encoded}`;
}
