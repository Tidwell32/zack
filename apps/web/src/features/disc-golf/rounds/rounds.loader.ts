import type { LoaderFunctionArgs } from 'react-router';

import { queryKeys } from '@/data-access/queryKeys';
import { fetchCourses, fetchPlayers, fetchRounds, type RoundsQueryParams } from '@/data-access/udisc';
import { queryClient } from '@/lib/queryClient';
import type { CourseInfo, RoundsResponse } from '@/types';
import { filterRoundsByDate, getSpecificQueryParams, hasDateFilters, isUserUploadedRounds } from '@/utils';

export type RoundsLoaderData = RoundsQueryParams & {
  data: Promise<{ courses: CourseInfo[]; players: string[]; rounds: RoundsResponse }>;
};

const tryGetFilteredUserRounds = (params: RoundsQueryParams): RoundsResponse | null => {
  if (!hasDateFilters(params)) return null;

  const cachedRounds = queryClient.getQueryData<RoundsResponse>(queryKeys.udisc.rounds({}).queryKey);
  if (!cachedRounds || cachedRounds.rounds.length === 0) return null;

  if (!isUserUploadedRounds(cachedRounds.rounds)) return null;

  const filteredRounds = filterRoundsByDate(cachedRounds.rounds, params);
  const filteredResponse: RoundsResponse = {
    ...cachedRounds,
    rounds: filteredRounds,
  };
  queryClient.setQueryData(queryKeys.udisc.rounds(params).queryKey, filteredResponse);

  return filteredResponse;
};

export const roundsLoader = ({ request }: LoaderFunctionArgs): RoundsLoaderData => {
  const params = getSpecificQueryParams<RoundsQueryParams>(request, ['player', 'startDate', 'endDate']);

  // If user has uploaded their own data, filter client-side
  const userFilteredRounds = tryGetFilteredUserRounds(params);
  if (userFilteredRounds !== null) {
    // Still need players from cache (set during import)
    const cachedPlayers = queryClient.getQueryData<string[]>(queryKeys.udisc.players.queryKey) ?? [];
    const cachedCourses = queryClient.getQueryData<CourseInfo[]>(queryKeys.udisc.courses.queryKey) ?? [];
    return {
      data: Promise.resolve({ courses: cachedCourses, players: cachedPlayers, rounds: userFilteredRounds }),
      ...params,
    };
  }

  // Otherwise, fetch from API as normal
  const roundsPromise = queryClient.fetchQuery({
    queryKey: queryKeys.udisc.rounds(params).queryKey,
    queryFn: () => fetchRounds(params),
  });

  const playersPromise = queryClient.fetchQuery({
    queryKey: queryKeys.udisc.players.queryKey,
    queryFn: () => fetchPlayers(),
  });

  const coursesPromises = queryClient.fetchQuery({
    queryKey: queryKeys.udisc.courses.queryKey,
    queryFn: () => fetchCourses(),
  });

  const combinedPromise = Promise.all([coursesPromises, playersPromise, roundsPromise]).then(
    ([courses, players, rounds]) => ({
      courses,
      players,
      rounds,
    })
  );

  return { data: combinedPromise, ...params };
};
