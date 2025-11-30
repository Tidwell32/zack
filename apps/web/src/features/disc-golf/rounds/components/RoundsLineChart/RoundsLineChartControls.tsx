import { useSearchParams } from 'react-router';

import { DateField, SelectField } from '@/components/forms';
import { CheckboxField } from '@/components/forms/fields/CheckboxField';
import { MultiSelectField } from '@/components/forms/fields/MultiSelectField';
import { Button, Popover, Typography } from '@/components/ui';
import { usePlayers } from '@/data-access/udisc/udisc.queries';
import type { RoundsLoaderData } from '@/features/disc-golf/rounds/rounds.loader';
import { useTypedLoaderData } from '@/hooks/useTypedLoaderData';

interface RoundsLineChartControlsProps {
  courses: Array<{ id: string; name: string }>;
  groupSimilarLayouts: boolean;
  selectedCourses: string[];
  selectedPlayer: string;
  setGroupSimilarLayouts: (value: boolean) => void;
  setSelectedCourses: (value: string[]) => void;
  setSelectedPlayer: (value: string) => void;
}

export const RoundsLineChartControls = ({
  courses,
  selectedCourses,
  groupSimilarLayouts,
  selectedPlayer,
  setSelectedCourses,
  setSelectedPlayer,
  setGroupSimilarLayouts,
}: RoundsLineChartControlsProps) => {
  const { data: _, ...queryParams } = useTypedLoaderData<RoundsLoaderData>();
  const { data: players = [] } = usePlayers(queryParams);
  const [__, setSearchParams] = useSearchParams();

  const playerOptions = players.map((player) => ({
    value: player,
    label: player,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2 flex-wrap">
        <DateField
          onChange={(value: string) => {
            setSearchParams((searchParams) => {
              searchParams.set('startDate', value);
              return searchParams;
            });
          }}
          value={queryParams.startDate ?? ''}
          className="w-fit"
        />

        <div className="flex flex-row">
          <DateField
            onChange={(value: string) => {
              setSearchParams((searchParams) => {
                searchParams.set('endDate', value);
                return searchParams;
              });
            }}
            value={queryParams.endDate ?? ''}
          />

          <Button
            variant="primaryGhost"
            onClick={() => {
              setSearchParams((searchParams) => {
                searchParams.delete('startDate');
                searchParams.delete('endDate');
                return searchParams;
              });
            }}
          >
            Clear
          </Button>
        </div>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <Typography variant="monoStat">Player:</Typography>
        <SelectField
          options={playerOptions}
          value={selectedPlayer}
          onChange={(val) => {
            setSelectedPlayer(val);
          }}
        />

        <CheckboxField
          label="Group similar layouts"
          checked={groupSimilarLayouts}
          onChange={(val) => {
            setGroupSimilarLayouts(val);
          }}
        />
      </div>
      <div className="mx-auto">
        <Popover
          trigger={
            <Button variant="primaryGhost">
              Courses {selectedCourses.length}/{courses.length}
            </Button>
          }
        >
          <div className="flex justify-end gap-2 pb-2">
            <Button
              onClick={() => {
                setSelectedCourses([]);
              }}
              variant="secondaryGhost"
            >
              None
            </Button>
            <Button
              onClick={() => {
                setSelectedCourses(courses.map((course) => course.id));
              }}
              variant="primaryGhost"
            >
              All
            </Button>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <MultiSelectField
              value={selectedCourses}
              onChange={(val) => {
                setSelectedCourses(val);
              }}
              options={courses.map((course) => ({ label: course.name, value: course.id }))}
            />
          </div>
        </Popover>
      </div>
    </div>
  );
};
