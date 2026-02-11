// Share link generator — creates a full URL with compressed bouquet data.
// The entire bouquet state is encoded in the `d` query parameter.

import type { Bouquet } from '../../types';
import { encodeBouquet } from './encoder';

export function generateShareLink(bouquet: Bouquet): string {
  const encoded = encodeBouquet(bouquet);
  return `${window.location.origin}/view?d=${encoded}`;
}
