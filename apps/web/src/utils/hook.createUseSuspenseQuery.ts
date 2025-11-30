import type { QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult } from '@tanstack/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';

export type SuspenseQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = Omit<UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryFn' | 'queryKey'>;

export const createUseSuspenseQueryHook =
  <TProps, TEntity, TError = Error>(
    fetchEntity: (props: TProps) => Promise<TEntity>,
    queryKey: (props: TProps) => QueryKey
  ) =>
  (
    props: TProps,
    queryOptions: SuspenseQueryOptions<TEntity, TError> = {}
  ): UseSuspenseQueryResult<TEntity, TError> => {
    const key = queryKey(props);
    return useSuspenseQuery<TEntity, TError>({
      queryKey: key,
      queryFn: () => fetchEntity(props),
      ...queryOptions,
    });
  };
