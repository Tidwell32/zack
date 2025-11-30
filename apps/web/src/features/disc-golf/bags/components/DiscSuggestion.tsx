import { Typography } from '@/components/ui';
import { useSuggestDiscs } from '@/data-access/catalog/catalog.queries';

import type { Gap } from './bags.utils';

export const DiscSuggestion = ({
  speedEnd,
  speedStart,
  stabilityEnd,
  stabilityStart,
}: Gap & { onClose: () => void }) => {
  const { data: suggestions = [] } = useSuggestDiscs({
    maxSpeed: speedEnd,
    maxStability: stabilityEnd,
    minSpeed: speedStart,
    minStability: stabilityStart,
  });

  if (!suggestions.length) {
    return <Typography className="text-accent-alt/50 text-center p-4  font-mono">No suggestions found</Typography>;
  }

  return (
    <div className="grid grid-cols-2 gap-1 p-2 max-h-3/4 overflow-y-auto font-mono">
      {suggestions.map((disc) => (
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
