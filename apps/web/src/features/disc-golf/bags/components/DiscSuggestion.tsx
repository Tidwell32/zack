import { Skeleton, Typography } from '@/components/ui';
import { useSuggestDiscs } from '@/data-access/catalog/catalog.queries';

import type { Gap } from './bags.utils';

export const DiscSuggestion = ({
  speedEnd,
  speedStart,
  stabilityEnd,
  stabilityStart,
}: Gap & { onClose: () => void }) => {
  const { data: suggestions = [], isLoading } = useSuggestDiscs({
    maxSpeed: speedEnd,
    maxStability: stabilityEnd,
    minSpeed: speedStart,
    minStability: stabilityStart,
  });

  if (!isLoading && !suggestions.length) {
    return <Typography className="text-accent-alt/50 text-center p-4  font-mono">No suggestions found</Typography>;
  }

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-1 p-2 font-mono">
      {!suggestions.length &&
        Array.from({ length: 20 }).map((_, i) => <Skeleton key={i} height={32} className="m-1" />)}
      {!!suggestions.length &&
        suggestions.map((disc) => (
          <div key={disc._id} className="flex items-center gap-2 px-2 py-1">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: disc.color }} />
            <div className="flex flex-col min-w-0">
              <Typography className="truncate font-bold">{disc.name}</Typography>
              <Typography className="text-xs truncate text-primary/50">{disc.brand}</Typography>
            </div>
            <Typography className=" text-secondary ml-auto shrink-0 font-bold">
              {disc.speed}/{disc.glide}/{disc.turn}/{disc.fade}
            </Typography>
          </div>
        ))}
    </div>
  );
};
