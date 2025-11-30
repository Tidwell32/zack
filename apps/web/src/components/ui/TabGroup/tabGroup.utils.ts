import { BEVEL_CONSTANTS, generateBevelPoints } from '@/utils';

import type { TabButtonProps } from './TabGroup';

export const getBevelPoints = (
  position: TabButtonProps['position'],
  w: number,
  h: number,
  bevel: number,
  inset = BEVEL_CONSTANTS.layerOffset
) => {
  const b = bevel;
  const i = inset;

  if (position === 'only') {
    return generateBevelPoints(w, h, bevel, inset);
  }

  if (position === 'first') {
    return `${i + b},${i} ${w},${i} ${w},${h - i} ${i + b},${h - i} ${i},${h - i - b} ${i},${i + b}`;
  }

  if (position === 'last') {
    return `0,${i} ${w - i - b},${i} ${w - i},${i + b} ${w - i},${h - i - b} ${w - i - b},${h - i} 0,${h - i}`;
  }
  return `0,${i} ${w},${i} ${w},${h - i} 0,${h - i}`;
};
