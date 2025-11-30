import type { QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

export type QueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryFn' | 'queryKey'>;

export const createUseQueryHook =
  <TProps, TEntity, TError = Error>(
    fetchEntity: (props: TProps) => Promise<TEntity>,
    queryKey: (props: TProps) => QueryKey,
    defaultEnabled?: (props: TProps) => boolean
  ) =>
  (props: TProps, queryOptions: QueryOptions<TEntity, TError> = {}): UseQueryResult<TEntity, TError> => {
    const { enabled = true, ...options } = queryOptions;
    const isEnabled = enabled && (defaultEnabled ? defaultEnabled(props) : true);

    const key = queryKey(props);
    return useQuery<TEntity, TError>({
      queryKey: key,
      queryFn: () => fetchEntity(props),
      ...options,
      enabled: isEnabled,
    });
  };
