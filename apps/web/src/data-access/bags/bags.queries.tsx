import type { Bag } from '@/types';
import { api, createUseQueryHook } from '@/utils';

import { queryKeys } from '../queryKeys';

export const fetchBags = async (): Promise<Bag[]> => api.get<Bag[]>('/bags');

export const useBags = createUseQueryHook(
  () => fetchBags(),
  () => queryKeys.bags.me.queryKey
);
