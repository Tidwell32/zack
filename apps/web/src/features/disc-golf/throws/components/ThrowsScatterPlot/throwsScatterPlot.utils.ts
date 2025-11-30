import type { MetricOption } from '@/components/ui/charts';
import { CHART_PALETTE } from '@/lib/chartConstants';

export const THROW_TYPES = [
  { key: 'RBH', label: 'RBH', fullLabel: 'R Backhand', hand: 'right', throw: 'backhand', color: CHART_PALETTE.cyan },
  { key: 'RFH', label: 'RFH', fullLabel: 'R Forehand', hand: 'right', throw: 'forehand', color: CHART_PALETTE.magenta },
  { key: 'LBH', label: 'LBH', fullLabel: 'L Backhand', hand: 'left', throw: 'backhand', color: CHART_PALETTE.amber },
  { key: 'LFH', label: 'LFH', fullLabel: 'L Forehand', hand: 'left', throw: 'forehand', color: CHART_PALETTE.emerald },
] as const;

export type ThrowTypeKey = (typeof THROW_TYPES)[number]['key'];

export interface HasThrowMeta {
  handedness?: string | null;
  primaryThrowType: string;
}

// Generic so it works for both Throw and Session
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const getThrowTypeKey = <T extends HasThrowMeta>(item: T): ThrowTypeKey | null => {
  const hand = item.handedness?.toLowerCase();
  const throwType = item.primaryThrowType.toLowerCase();
  if (!hand || !throwType) return null;

  const isBackhand = throwType.includes('backhand');
  const isForehand = throwType.includes('forehand');
  if (!isBackhand && !isForehand) return null;

  const handPrefix = hand === 'left' ? 'L' : hand === 'right' ? 'R' : null;
  if (!handPrefix) return null;

  return `${handPrefix}${isBackhand ? 'BH' : 'FH'}`;
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const getAvailableThrowTypes = <T extends HasThrowMeta>(items: T[]): Set<ThrowTypeKey> => {
  const present = new Set<ThrowTypeKey>();
  for (const item of items) {
    const key = getThrowTypeKey(item);
    if (key) present.add(key);
  }
  return present;
};

export const buildThrowTypeOptions = (available: Set<ThrowTypeKey>): MetricOption[] => {
  return THROW_TYPES.filter((t) => available.has(t.key)).map((t) => ({
    key: t.key,
    label: t.label,
    color: t.color,
  }));
};
