import type { LoaderFunctionArgs } from 'react-router';

import { queryKeys } from '@/data-access/queryKeys';
import { fetchThrows } from '@/data-access/techdisc/techdisc.queries';
import { type ThrowsQueryParams } from '@/data-access/techdisc/techdisc.queries';
import { queryClient } from '@/lib/queryClient';
import type { Throw } from '@/types/techdisc';
import { filterThrowsByDate, getSpecificQueryParams, hasDateFilters, isUserUploadedThrows } from '@/utils';

export type ThrowsLoaderData = ThrowsQueryParams & {
  throws: Promise<Throw[]>;
};

const tryGetFilteredUserData = (params: ThrowsQueryParams): Throw[] | null => {
  if (!hasDateFilters(params)) return null;

  const cachedThrows = queryClient.getQueryData<Throw[]>(queryKeys.techdisc.throws({}).queryKey);
  if (!cachedThrows || cachedThrows.length === 0) return null;

  if (!isUserUploadedThrows(cachedThrows)) return null;

  const filtered = filterThrowsByDate(cachedThrows, params);
  queryClient.setQueryData(queryKeys.techdisc.throws(params).queryKey, filtered);

  return filtered;
};

export const throwsLoader = ({ request }: LoaderFunctionArgs): ThrowsLoaderData => {
  const params = getSpecificQueryParams<ThrowsQueryParams>(request, ['date', 'startDate', 'endDate']);

  // If user has uploaded their own data, filter client-side
  const userFilteredData = tryGetFilteredUserData(params);
  if (userFilteredData !== null) {
    return { throws: Promise.resolve(userFilteredData), ...params };
  }

  // Otherwise, fetch from API as normal
  const throwsPromise = queryClient.fetchQuery({
    queryKey: queryKeys.techdisc.throws(params).queryKey,
    queryFn: () => fetchThrows(params),
  });

  return { throws: throwsPromise, ...params };
};
