import { BEVEL_CONSTANTS } from './ui.designConstants';

export const generateBevelPoints = (
  width: number,
  height: number,
  bevel: number,
  inset: number = BEVEL_CONSTANTS.layerOffset
): string => {
  const w = width;
  const h = height;
  const c = bevel;

  return [
    `${c + inset},${inset}`,
    `${w - c - inset},${inset}`,
    `${w - inset},${c + inset}`,
    `${w - inset},${h - c - inset}`,
    `${w - c - inset},${h - inset}`,
    `${c + inset},${h - inset}`,
    `${inset},${h - c - inset}`,
    `${inset},${c + inset}`,
  ].join(' ');
};
