import type { LoaderFunctionArgs } from 'react-router';

import { queryKeys } from '@/data-access/queryKeys';
import type { SessionsQueryParams } from '@/data-access/techdisc/techdisc.queries';
import { fetchSessions } from '@/data-access/techdisc/techdisc.queries';
import { queryClient } from '@/lib/queryClient';
import type { Session, Throw } from '@/types/techdisc';
import { filterSessionsByDate, getSpecificQueryParams, hasDateFilters, isUserUploadedSessions } from '@/utils';

export type SessionsLoaderData = SessionsQueryParams & {
  sessions: Promise<Session[]>;
};

const tryGetFilteredUserSessions = (params: SessionsQueryParams): Session[] | null => {
  if (!hasDateFilters(params)) return null;

  const cachedSessions = queryClient.getQueryData<Session[]>(queryKeys.techdisc.sessions({}).queryKey);
  if (!cachedSessions || cachedSessions.length === 0) return null;

  const cachedThrows = queryClient.getQueryData<Throw[]>(queryKeys.techdisc.throws({}).queryKey);
  if (!cachedThrows || !isUserUploadedSessions(cachedThrows)) return null;

  const filtered = filterSessionsByDate(cachedSessions, params);
  queryClient.setQueryData(queryKeys.techdisc.sessions(params).queryKey, filtered);

  return filtered;
};

export const sessionsLoader = ({ request }: LoaderFunctionArgs): SessionsLoaderData => {
  const params = getSpecificQueryParams<SessionsQueryParams>(request, ['date', 'startDate', 'endDate']);

  // If user has uploaded their own data, filter client-side
  const userFilteredSessions = tryGetFilteredUserSessions(params);
  if (userFilteredSessions !== null) {
    return { sessions: Promise.resolve(userFilteredSessions), ...params };
  }

  // Otherwise, fetch from API as normal
  const sessionsPromise = queryClient.fetchQuery({
    queryKey: queryKeys.techdisc.sessions(params).queryKey,
    queryFn: () => fetchSessions(params),
  });

  return { sessions: sessionsPromise, ...params };
};
