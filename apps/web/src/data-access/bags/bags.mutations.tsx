import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Bag, Disc } from '@/types';
import { api } from '@/utils';

import { queryKeys } from '../queryKeys';

type CreateBagInput = Pick<Bag, 'name'>;
export type AddDiscInput = Pick<
  Disc,
  'adjustedFlight' | 'catalogDiscId' | 'colorHex' | 'notes' | 'plastic' | 'weight'
> & {
  bagId: string;
};

const createBag = async (input: CreateBagInput): Promise<Bag> => {
  return api.post<Bag>('/bags', input);
};

export const useCreateBag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBag,
    onSuccess: (newBag) => {
      queryClient.setQueryData<Bag[]>(queryKeys.bags.me.queryKey, (old) => {
        if (!old) return [newBag];
        return [...old, newBag];
      });
    },
  });
};

const addDiscToBag = async ({ bagId, ...input }: AddDiscInput): Promise<Disc> => {
  return api.post<Disc>(`/bags/${bagId}/discs`, input);
};

export const useAddDiscToBag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addDiscToBag,
    onSuccess: (newDisc) => {
      queryClient.setQueryData<Disc[]>(queryKeys.bags.discs(newDisc.bagId).queryKey, (old) => {
        if (!old) return [newDisc];
        return [...old, newDisc];
      });
    },
  });
};
