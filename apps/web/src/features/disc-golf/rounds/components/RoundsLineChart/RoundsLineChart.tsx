import { useEffect, useMemo, useState } from 'react';

import { Typography } from '@/components/ui';
import type { LineSeries } from '@/components/ui/charts';
import { LineChart } from '@/components/ui/charts';
import { useRounds } from '@/data-access/udisc/udisc.queries';
import { useTypedLoaderData } from '@/hooks/useTypedLoaderData';
import { SERIES_COLORS } from '@/lib/chartConstants';
import type { Round } from '@/types/udisc';

import type { RoundsLoaderData } from '../../rounds.loader';

import { RoundsLineChartControls } from './RoundsLineChartControls';
import { formatDate, getCourseIdAndName, getCourses } from './utils';

export const RoundsLineChart = () => {
  const { data: _, ...queryParams } = useTypedLoaderData<RoundsLoaderData>();
  const { data: { rounds, primaryPlayer } = { rounds: [], primaryPlayer: 'Zack' } } = useRounds(queryParams);

  const [selectedPlayer, setSelectedPlayer] = useState(primaryPlayer);
  const [groupSimilarLayouts, setGroupSimilarLayouts] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const roundsWithPlayer = useMemo(
    () =>
      rounds.filter(
        (round) => !!round.players.find((player) => player.playerName === selectedPlayer && player.isComplete)
      ),
    [rounds, selectedPlayer]
  );

  const courses = useMemo(
    () => getCourses(roundsWithPlayer, groupSimilarLayouts),
    [groupSimilarLayouts, roundsWithPlayer]
  );

  const data = useMemo(() => {
    const playerRounds = roundsWithPlayer.reduce<Array<Record<string, number | string>>>((acc, round: Round) => {
      const { courseId } = getCourseIdAndName(round, groupSimilarLayouts);
      if (!selectedCourses.includes(courseId)) return acc;
      const plusMinus = round.players.find((player) => player.playerName === selectedPlayer)?.plusMinus;

      return [
        ...acc,
        {
          [courseId]: plusMinus!,
          date: round.startTime.split('T')[0],
        },
      ];
    }, []);

    return playerRounds;
  }, [groupSimilarLayouts, roundsWithPlayer, selectedCourses, selectedPlayer]);

  const series: LineSeries[] = useMemo(
    () =>
      courses
        .filter((course) => selectedCourses.includes(course.id))
        .map((course) => ({
          dataKey: course.id,
          name: course.name,
          color: SERIES_COLORS[courses.findIndex((c) => course.id === c.id) % SERIES_COLORS.length],
          yAxisId: 'left',
        })),
    [courses, selectedCourses]
  );

  useEffect(() => {
    queueMicrotask(() => {
      setSelectedCourses(courses.map((course) => course.id));
    });
  }, [courses]);

  return (
    <div className="flex flex-col gap-4 font-mono">
      <RoundsLineChartControls
        courses={courses}
        setSelectedPlayer={setSelectedPlayer}
        selectedPlayer={selectedPlayer}
        selectedCourses={selectedCourses}
        setSelectedCourses={setSelectedCourses}
        groupSimilarLayouts={groupSimilarLayouts}
        setGroupSimilarLayouts={setGroupSimilarLayouts}
      />
      {!data.length && (
        <div className="p-12">
          <Typography>
            {!courses.length ? 'No recorded rounds, upload your udisc rounds!' : 'Choose a course'}
          </Typography>
        </div>
      )}

      {!!data.length && (
        <LineChart
          connectNulls
          data={data.reverse()}
          dualAxis={false}
          leftAxisLabel="+/- Par"
          series={series}
          valueFormatter={(v) => (v > 0 ? `+${v}` : `${v}`)}
          xDataKey="date"
          xTickFormatter={formatDate}
          showLegend={false}
          showGrid
        />
      )}
    </div>
  );
};
