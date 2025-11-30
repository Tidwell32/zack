import type { Disc } from '@/types';
import { api, createUseQueryHook } from '@/utils';

import { queryKeys } from '../queryKeys';

interface DiscsForBagProps {
  bagId?: string;
}

const fetchDiscsForBag = async ({ bagId }: DiscsForBagProps): Promise<Disc[]> =>
  api.get<Disc[]>(`/bags/${bagId!}/discs`);

export const useDiscsForBag = createUseQueryHook<DiscsForBagProps, Disc[]>(
  ({ bagId }) => fetchDiscsForBag({ bagId }),
  ({ bagId }) => queryKeys.bags.discs(bagId).queryKey,
  ({ bagId }) => !!bagId
);
