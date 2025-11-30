import type { Disc } from '@/types/discs';
import { getEffectiveFlightNumbers } from '@/utils';

export interface Gap {
  speedEnd: number;
  speedStart: number;
  stabilityEnd: number;
  stabilityStart: number;
}

// Thanks for this one Claude!
export const findGaps = (discs: Disc[], gapThreshold = 3): Gap[] => {
  // Build a set of occupied (speed, stability) cells
  const occupied = new Set<string>();

  for (const disc of discs) {
    const { speed, fade, turn } = getEffectiveFlightNumbers(disc);
    const stability = Math.round(fade + turn);
    const roundedSpeed = Math.round(speed);
    occupied.add(`${roundedSpeed},${stability}`);
  }

  // Find rectangular gaps that meet threshold in BOTH dimensions
  const gaps: Gap[] = [];

  // Scan for rectangular empty regions
  // For each potential top-left corner of a gap
  for (let speedStart = 1; speedStart <= 13; speedStart++) {
    for (let stabilityStart = -5; stabilityStart <= 4; stabilityStart++) {
      // Skip if this cell is occupied
      if (occupied.has(`${speedStart},${stabilityStart}`)) continue;

      // Try to expand the rectangle right and down
      let maxSpeedEnd = 13;
      let maxStabilityEnd = 4;

      // Find the maximum rectangle starting from this point
      for (let speed = speedStart; speed <= maxSpeedEnd; speed++) {
        for (let stability = stabilityStart; stability <= maxStabilityEnd; stability++) {
          if (occupied.has(`${speed},${stability}`)) {
            if (stability === stabilityStart) {
              // Can't extend speed any further
              maxSpeedEnd = speed - 1;
            } else {
              // Can't extend stability any further for this speed row
              maxStabilityEnd = stability - 1;
            }
            break;
          }
        }
      }

      const speedSize = maxSpeedEnd - speedStart + 1;
      const stabilitySize = maxStabilityEnd - stabilityStart + 1;

      // Only add if both dimensions meet threshold
      if (speedSize >= gapThreshold && stabilitySize >= gapThreshold) {
        gaps.push({
          speedStart,
          speedEnd: maxSpeedEnd,
          stabilityStart,
          stabilityEnd: maxStabilityEnd,
        });
      }
    }
  }

  // Remove overlapping gaps - keep only non-overlapping ones
  const sortedGaps = [...gaps].sort((a, b) => {
    const areaA = (a.speedEnd - a.speedStart + 1) * (a.stabilityEnd - a.stabilityStart + 1);
    const areaB = (b.speedEnd - b.speedStart + 1) * (b.stabilityEnd - b.stabilityStart + 1);
    return areaB - areaA;
  });

  const maximalGaps: Gap[] = [];
  const maxOverlap = 1;

  for (const gap of sortedGaps) {
    // Check if this gap overlaps too much with any already selected gap
    const overlaps = maximalGaps.some((selected) => {
      const speedOverlapAmount =
        Math.min(gap.speedEnd, selected.speedEnd) - Math.max(gap.speedStart, selected.speedStart) + 1;
      const stabilityOverlapAmount =
        Math.min(gap.stabilityEnd, selected.stabilityEnd) - Math.max(gap.stabilityStart, selected.stabilityStart) + 1;

      return speedOverlapAmount > maxOverlap && stabilityOverlapAmount > maxOverlap;
    });

    if (!overlaps) {
      maximalGaps.push(gap);
    }
  }

  // Split gaps larger than 4 in either dimension
  const splitGaps: Gap[] = [];
  for (const gap of maximalGaps) {
    const speedSize = gap.speedEnd - gap.speedStart + 1;
    const stabilitySize = gap.stabilityEnd - gap.stabilityStart + 1;

    if (speedSize > 4 && stabilitySize > 4) {
      const speedMid = Math.floor((gap.speedStart + gap.speedEnd) / 2);
      const stabilityMid = Math.floor((gap.stabilityStart + gap.stabilityEnd) / 2);
      splitGaps.push({
        speedStart: gap.speedStart,
        speedEnd: speedMid,
        stabilityStart: gap.stabilityStart,
        stabilityEnd: stabilityMid,
      });
      splitGaps.push({
        speedStart: speedMid + 1,
        speedEnd: gap.speedEnd,
        stabilityStart: gap.stabilityStart,
        stabilityEnd: stabilityMid,
      });
      splitGaps.push({
        speedStart: gap.speedStart,
        speedEnd: speedMid,
        stabilityStart: stabilityMid + 1,
        stabilityEnd: gap.stabilityEnd,
      });
      splitGaps.push({
        speedStart: speedMid + 1,
        speedEnd: gap.speedEnd,
        stabilityStart: stabilityMid + 1,
        stabilityEnd: gap.stabilityEnd,
      });
    } else if (speedSize > 4) {
      const midpoint = Math.floor((gap.speedStart + gap.speedEnd) / 2);
      splitGaps.push({ ...gap, speedEnd: midpoint });
      splitGaps.push({ ...gap, speedStart: midpoint + 1 });
    } else if (stabilitySize > 4) {
      const midpoint = Math.floor((gap.stabilityStart + gap.stabilityEnd) / 2);
      splitGaps.push({ ...gap, stabilityEnd: midpoint });
      splitGaps.push({ ...gap, stabilityStart: midpoint + 1 });
    } else {
      splitGaps.push(gap);
    }
  }

  return splitGaps;
};
