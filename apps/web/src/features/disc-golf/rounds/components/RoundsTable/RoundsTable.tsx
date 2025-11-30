import { useState } from 'react';

import { CheckboxField } from '@/components/forms/fields/CheckboxField';
import { Button, ClippedCard, Popover, Table, TableBody, TableCell, TableRow } from '@/components/ui';
import { usePlayers, useRounds } from '@/data-access/udisc/udisc.queries';
import { useTypedLoaderData } from '@/hooks/useTypedLoaderData';

import type { RoundsLoaderData } from '../../rounds.loader';

import { RoundRow } from './RoundRow';

export const RoundsTable = () => {
  const { data: _, ...queryParams } = useTypedLoaderData<RoundsLoaderData>();
  const [showIncomplete, setShowIncomplete] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [playerFilterMode, setPlayerFilterMode] = useState<'AND' | 'OR'>('OR');

  const { data: { rounds, primaryPlayer } = { rounds: [], primaryPlayer: 'Zack' } } = useRounds(queryParams);
  const { data: players = [] } = usePlayers({});

  const togglePlayer = (playerName: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerName) ? prev.filter((p) => p !== playerName) : [...prev, playerName]
    );
  };

  const filteredRounds = rounds.filter((round) => {
    if (!showIncomplete) {
      const hasCompletePlayer = round.players.some((p) => p.isComplete);
      if (!hasCompletePlayer) return false;
    }

    if (selectedPlayers.length > 0) {
      const roundPlayerNames = round.players.map((p) => p.playerName);

      if (playerFilterMode === 'AND') {
        const hasAllPlayers = selectedPlayers.every((name) => roundPlayerNames.includes(name));
        if (!hasAllPlayers) return false;
      } else {
        const hasSelectedPlayer = selectedPlayers.some((name) => roundPlayerNames.includes(name));
        if (!hasSelectedPlayer) return false;
      }
    }

    return true;
  });

  const shouldExpandByDefault = selectedPlayers.length > 1 && playerFilterMode === 'AND';

  return (
    <ClippedCard className="font-mono">
      <div className="flex items-center gap-3 w-full px-5">
        <CheckboxField
          className="mr-auto"
          checked={showIncomplete}
          label="Show incomplete rounds"
          onChange={(value) => {
            setShowIncomplete(value);
          }}
        />

        <Popover
          trigger={
            <Button variant="primaryGhost">
              Players {selectedPlayers.length > 0 && `(${selectedPlayers.length})`}
            </Button>
          }
        >
          <div className="flex flex-col  max-h-[400px]">
            <div className="flex flex-row gap-2 mx-auto">
              <Button
                onClick={() => {
                  setPlayerFilterMode('OR');
                }}
                variant="primaryGhost"
                selected={playerFilterMode === 'OR'}
              >
                OR
              </Button>
              <Button
                onClick={() => {
                  setPlayerFilterMode('AND');
                }}
                variant="primaryGhost"
                selected={playerFilterMode === 'AND'}
              >
                AND
              </Button>
            </div>

            {selectedPlayers.length > 0 && (
              <Button
                onClick={() => {
                  setSelectedPlayers([]);
                }}
                className="mx-auto"
                variant="secondaryGhost"
              >
                Clear
              </Button>
            )}

            {players.map((player, i) => (
              <CheckboxField
                key={`${player}-${i}`}
                label={player}
                checked={selectedPlayers.includes(player)}
                onChange={() => {
                  togglePlayer(player);
                }}
              />
            ))}
          </div>
        </Popover>
      </div>
      <Table>
        <TableBody>
          {filteredRounds.length === 0 ? (
            <TableRow>
              <TableCell>
                {rounds.length === 0
                  ? 'No rounds yet. Import a CSV to get started.'
                  : 'No rounds match the current filters.'}
              </TableCell>
            </TableRow>
          ) : (
            filteredRounds.map((round) => (
              <RoundRow
                key={round._id}
                defaultExpanded={shouldExpandByDefault}
                primaryPlayer={primaryPlayer}
                round={round}
                selectedPlayers={selectedPlayers}
                showIncomplete={showIncomplete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </ClippedCard>
  );
};
