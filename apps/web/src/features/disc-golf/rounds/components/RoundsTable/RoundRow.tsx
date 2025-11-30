import { useEffect, useState } from 'react';

import { ChevronsRight } from '@/components/icons';
import { TableCell, TableRow, Typography } from '@/components/ui';
import type { Round } from '@/types';
import { cn, formatDate } from '@/utils';

const ScoreMark = ({
  className,
  mark,
  par,
  score,
}: {
  className?: string;
  mark: boolean;
  par: number;
  score: number;
}) => {
  const holeScore = score - par;

  if (score === 0 || holeScore === 0 || !mark) {
    return (
      <div className={cn('w-5 h-5 flex items-center justify-center', className)}>
        <Typography className="text-xs md:text-xs font-medium text-neutral-400">{score}</Typography>
      </div>
    );
  }

  if (holeScore <= -2) {
    return (
      <div
        className={cn('w-5 h-5 flex items-center justify-center rounded-full border-2 border-yellow-400', className)}
      >
        <Typography as="span" className="text-xs md:text-xs font-medium text-yellow-400">
          {score}
        </Typography>
      </div>
    );
  }

  if (holeScore === -1) {
    return (
      <div className={cn('w-5 h-5 flex items-center justify-center rounded-full border-2 border-green-400', className)}>
        <Typography as="span" className="text-xs md:text-xs font-medium text-green-400">
          {score}
        </Typography>
      </div>
    );
  }

  if (holeScore === 1) {
    return (
      <div className={cn('w-5 h-5 flex items-center justify-center border-2 border-orange-400', className)}>
        <Typography as="span" className="text-xs md:text-xs font-medium text-orange-400">
          {score}
        </Typography>
      </div>
    );
  }

  return (
    <div className={cn('w-5 h-5 flex items-center justify-center border-2 border-red-400', className)}>
      <Typography as="span" className="text-xs md:text-xs font-medium text-red-400">
        {score}
      </Typography>
    </div>
  );
};

const Scorecard = ({
  playerName,
  round,
  showName = true,
  variant = 'player',
}: {
  playerName: string;
  round: Round;
  showName?: boolean;
  variant?: 'hole' | 'par' | 'player';
}) => {
  const player = round.players.find((p) => p.playerName === playerName);

  const total =
    player?.total ??
    player?.scores.reduce((sum, score) => sum + score, 0) ??
    round.pars.reduce((sum, score) => sum + score, 0);
  const plusMinusText = player
    ? player.plusMinus === 0
      ? 'E'
      : player.plusMinus > 0
        ? `+${player.plusMinus}`
        : `${player.plusMinus}`
    : 0;

  const scores =
    variant === 'hole'
      ? round.pars.map((_, i) => i + 1)
      : variant === 'par'
        ? round.pars
        : (round.players.find((p) => p.playerName === playerName)?.scores ?? []);

  return (
    <div className="flex flex-row gap-2 p-0.5 items-center w-full flex-1">
      {showName && (
        <Typography className="truncate text-xs md:text-sm text-text-muted text-start w-16">{playerName}</Typography>
      )}
      {scores.map((score, i) => (
        <ScoreMark
          mark={variant === 'player'}
          key={i}
          par={round.pars[i] ?? 3}
          score={score}
          className={i === 9 ? 'ml-4' : ''}
        />
      ))}

      {variant !== 'hole' && (
        <>
          <Typography className="text-sm md:text-sm ml-auto">{total}</Typography>
          {variant === 'player' && (
            <>
              <Typography className="text-xxs md:text-xxs text-primary">{plusMinusText}</Typography>
            </>
          )}
        </>
      )}
    </div>
  );
};

export const RoundRow = ({
  defaultExpanded,
  primaryPlayer,
  round,
  selectedPlayers,
  showIncomplete = false,
}: {
  defaultExpanded: boolean;
  primaryPlayer: string;
  round: Round;
  selectedPlayers: string[];
  showIncomplete?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const otherPlayers = round.players.filter((player) => showIncomplete || player.isComplete).length - 1;
  const playersToShow = round.players.filter((player) => showIncomplete || player.isComplete);

  const primaryScorecard =
    playersToShow.find((player) => player.playerName === primaryPlayer)?.playerName ?? playersToShow[0]?.playerName;

  const selectedPlayersInRound = !!selectedPlayers.length
    ? playersToShow.filter((player) => selectedPlayers.includes(player.playerName)).map((player) => player.playerName)
    : [primaryScorecard];

  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  return (
    <TableRow>
      <TableCell>
        <details open={isExpanded} className="group">
          <summary
            className="list-none cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded((prevValue) => !prevValue);
            }}
          >
            <div className="flex flex-row gap-2 items-center">
              <ChevronsRight className="group-open:rotate-90 transition-transform stroke-primary group-open:stroke-secondary" />

              <Typography className="md:text-xs">{round.courseName}</Typography>
              <Typography className="md:text-xxs text-text-muted mr-auto">{round.layoutName}</Typography>
              {!!otherPlayers && (
                <Typography className="md:text-xxs">
                  +{otherPlayers} {otherPlayers === 1 ? 'other' : 'others'}
                </Typography>
              )}
              <Typography className="md:text-xs text-text-muted">{formatDate(round.startTime)}</Typography>
            </div>

            {!isExpanded &&
              selectedPlayersInRound.map((player, i) => (
                <Scorecard key={`${player}-${i}`} playerName={player} round={round} />
              ))}
          </summary>
          <div className="flex flex-col gap-1">
            <Scorecard playerName="Hole" round={round} variant="hole" />
            <Scorecard playerName="Par" round={round} variant="par" />
            {playersToShow.map((player, i) => (
              <Scorecard key={`${player.playerName}-${i}`} playerName={player.playerName} round={round} />
            ))}
          </div>
        </details>
      </TableCell>
    </TableRow>
  );
};
