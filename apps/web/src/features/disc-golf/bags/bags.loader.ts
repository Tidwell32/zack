import { fetchBags } from '@/data-access/bags/bags.queries';
import { queryKeys } from '@/data-access/queryKeys';
import { queryClient } from '@/lib/queryClient';
import type { Bag } from '@/types/bags';

export interface BagsLoaderData {
  bags: Promise<Bag[]>;
}

export const bagsLoader = (): BagsLoaderData => {
  const bagsPromise = queryClient.fetchQuery({
    queryKey: queryKeys.bags.me.queryKey,
    queryFn: fetchBags,
  });

  return { bags: bagsPromise };
};
