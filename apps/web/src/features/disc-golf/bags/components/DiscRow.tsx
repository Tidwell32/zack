import { EditIcon, TrashIcon } from '@/components/icons';
import { Grid, IconButton, Typography } from '@/components/ui';
import type { Disc, FlightNumbers } from '@/types';
import { getEffectiveFlightNumbers } from '@/utils';

const DiscStats = ({ flightNumbers }: { flightNumbers: FlightNumbers }) => {
  const { speed, glide, turn, fade } = flightNumbers;

  const formatStat = (value: number) => {
    const hasHalf = Math.abs(value) % 1 === 0.5;
    const intPart = value < 0 ? Math.ceil(value) : Math.floor(value);

    return hasHalf ? (
      <>
        {intPart}
        <sup className="text-[0.6em]">5</sup>
      </>
    ) : (
      value
    );
  };

  return (
    <Grid.Parent gap="none">
      <Grid.Child xs={6} className="w-6 bg-secondary/20">
        <Typography>{formatStat(speed)}</Typography>
      </Grid.Child>
      <Grid.Child xs={6} className="bg-primary/20">
        <Typography>{formatStat(glide)}</Typography>
      </Grid.Child>
      <Grid.Child xs={6} className="w-6 bg-primary/20">
        <Typography>{formatStat(turn)}</Typography>
      </Grid.Child>
      <Grid.Child xs={6} className="bg-secondary/20">
        <Typography>{formatStat(fade)}</Typography>
      </Grid.Child>
    </Grid.Parent>
  );
};

export const DiscRow = ({
  disc,
  isSelected,
  onDelete,
  onEdit,
}: {
  disc: Disc;
  isSelected: boolean;
  onDelete: () => void;
  onEdit: () => void;
}) => {
  return (
    <div className="flex flex-row items-center justify-between -my-1.5">
      <div className="flex flex-col items-start">
        <Typography variant="body-sm" className="text-text-muted">
          {disc.brand}
        </Typography>
        <Typography>{disc.name}</Typography>
      </div>
      {isSelected && (
        <div className="flex flex-row ml-auto mr-4">
          <IconButton variant="primaryGhost" onClick={onEdit}>
            <EditIcon size={18} />
          </IconButton>
          <IconButton variant="primaryGhost" onClick={onDelete}>
            <TrashIcon size={18} />
          </IconButton>
        </div>
      )}
      <DiscStats flightNumbers={getEffectiveFlightNumbers(disc)} />
    </div>
  );
};
