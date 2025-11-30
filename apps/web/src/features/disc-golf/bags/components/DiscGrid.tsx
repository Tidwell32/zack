import { useState } from 'react';

import { Button, ClippedCard, Dot, HudDrawer, Typography } from '@/components/ui/';
import { useDiscsForBag } from '@/data-access/discs';
import type { Disc } from '@/types';
import { cn, COLORS, getEffectiveFlightNumbers } from '@/utils';

import { useBagsContext } from '../providers/BagsProvider';

import type { Gap } from './bags.utils';
import { findGaps } from './bags.utils';
import { DiscSuggestion } from './DiscSuggestion';

const getPosition = (disc: Disc) => {
  const { turn, fade, speed } = getEffectiveFlightNumbers(disc);
  const stability = turn + fade;

  // 4 is our 0 on an axis that goes from 4 to -5
  const xPosition = 4 - stability;
  // How far across the grid this stability lies
  const xPercent = (xPosition / 9) * 100;

  // Speed goes up to 14
  const yPosition = 14 - speed;
  // How far up the grid this speed lies
  const yPercent = (yPosition / 14) * 100;

  return { xPercent, yPercent };
};

export const DiscGrid = () => {
  const { selectedBag, selectedDisc, setSelectedDisc } = useBagsContext();
  const { data: discs = [] } = useDiscsForBag({ bagId: selectedBag?._id });
  const [selectedGap, setSelectedGap] = useState<Gap | null>(null);
  const gaps = findGaps(discs, 3);

  return (
    <>
      <ClippedCard className="font-mono w-full md:w-1/2 flex-1">
        <Typography>Stability (turn + fade) vs Speed</Typography>
        <div className="relative w-full h-[600px] overflow-x-clip">
          <div
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: 'auto repeat(9, 1fr)',
              gridTemplateRows: 'repeat(14, 1fr) auto',
            }}
          >
            {/* Y Axis */}
            {Array.from({ length: 14 }).map((_, i) => {
              const speed = 14 - i;

              return (
                <div
                  key={`speed-${i}`}
                  className="flex items-start -mt-2 justify-end pr-2"
                  style={{
                    gridColumn: 1,
                    gridRow: i + 1,
                  }}
                >
                  <Typography>{speed}</Typography>
                </div>
              );
            })}

            {/* Grid lines */}
            {Array.from({ length: 14 }).map((_, rowIndex) =>
              Array.from({ length: 9 }).map((__, colIndex) => (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="border border-primary/20"
                  style={{
                    gridColumn: colIndex + 2,
                    gridRow: rowIndex + 1,
                  }}
                />
              ))
            )}

            {/* X Axis labels */}
            <div
              className="relative flex justify-between pt-1 -ml-1"
              style={{
                gridColumn: '2 / -1',
                gridRow: 15,
              }}
            >
              {Array.from({ length: 10 }).map((_, labelIndex) => {
                const stability = 4 - labelIndex;
                return (
                  <div key={`x-label-${labelIndex}`} className="flex items-center">
                    <Typography className="text-xs text-primary">
                      {stability > 0 ? `+${stability}` : stability}
                    </Typography>
                  </div>
                );
              })}
            </div>

            {/* Big relative container so we can use our calculated positions, fancy!..? */}
            <div className="relative col-start-2 col-span-9 row-start-1 row-span-14">
              {/* Gap Circles */}
              {gaps.map((gap, index) => {
                // X position: stability range
                const xColStart = 4 - gap.stabilityEnd;
                const xColEnd = 4 - gap.stabilityStart;
                const xPercent = ((xColStart + xColEnd) / 2 / 9) * 100;
                const widthPercent = ((xColEnd - xColStart + 1) / 9) * 100;

                // Y position: speed range
                const yRowStart = 14 - gap.speedEnd;
                const yRowEnd = 14 - gap.speedStart;
                const yPercent = ((yRowStart + yRowEnd) / 2 / 14) * 100;
                const heightPercent = ((yRowEnd - yRowStart + 1) / 14) * 100;

                return (
                  <div
                    key={`gap-${index}`}
                    className="absolute rounded-full bg-primary/5 border-2 border-dashed border-primary/20 flex justify-center items-center"
                    style={{
                      left: `${xPercent}%`,
                      top: `${yPercent}%`,
                      width: `${widthPercent}%`,
                      height: `${heightPercent}%`,
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'auto',
                    }}
                  >
                    <Button
                      onClick={() => {
                        setSelectedGap(gap);
                      }}
                      variant="secondaryGhost"
                    >
                      Suggest A Disc
                    </Button>
                  </div>
                );
              })}

              {/* And our discs... almost done */}
              {discs.map((disc) => {
                const { xPercent, yPercent } = getPosition(disc);
                const isSelected = disc._id === selectedDisc?._id;

                return (
                  <div
                    key={disc._id}
                    className={cn('absolute cursor-pointer translate-x-1/2 -translate-y-1/2', isSelected && 'z-10')}
                    style={{
                      left: `${xPercent}%`,
                      top: `${yPercent}%`,
                      pointerEvents: 'auto',
                    }}
                    onClick={() => {
                      setSelectedDisc(disc);
                    }}
                  >
                    <div className="relative">
                      <Dot
                        color={disc.colorHex ?? COLORS.primary}
                        className={cn(
                          'hover:w-5 hover:h-5 transition-all cursor-pointer absolute -translate-x-1/2 -translate-y-1/2',
                          isSelected && 'h-5 w-5'
                        )}
                      />

                      <Typography
                        className={cn(
                          'absolute -translate-x-1/2 translate-y-1/4 whitespace-nowrap px-1',
                          isSelected && 'font-bold bg-surface-800'
                        )}
                      >
                        {disc.name}
                      </Typography>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ClippedCard>
      {!!selectedGap && (
        <HudDrawer
          open={!!selectedGap}
          onOpenChange={() => {
            setSelectedGap(null);
          }}
          title="Suggestions"
        >
          <DiscSuggestion
            {...selectedGap}
            onClose={() => {
              setSelectedGap(null);
            }}
          />
        </HudDrawer>
      )}
    </>
  );
};
