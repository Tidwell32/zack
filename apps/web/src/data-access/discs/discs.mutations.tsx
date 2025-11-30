import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Disc } from '@/types';
import { api } from '@/utils';

import { queryKeys } from '../queryKeys';

type UpdateDiscInput = Pick<Disc, 'adjustedFlight' | 'colorHex' | 'notes' | 'plastic' | 'weight'> & {
  _id: string;
};

interface DeleteDiscInput {
  _id: string;
  bagId: string;
}

const updateDisc = async ({ _id, ...input }: UpdateDiscInput): Promise<Disc> => {
  return api.patch<Disc>(`/discs/${_id}`, input);
};

export const useUpdateDisc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDisc,
    onSuccess: (updatedDisc) => {
      queryClient.setQueryData<Disc[]>(queryKeys.bags.discs(updatedDisc.bagId).queryKey, (old) => {
        if (!old) return old;
        return old.map((disc) => (disc._id === updatedDisc._id ? updatedDisc : disc));
      });
    },
  });
};

const deleteDisc = async ({ _id }: DeleteDiscInput): Promise<void> => {
  return api.delete(`/discs/${_id}`);
};

export const useDeleteDisc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDisc,
    onSuccess: (_, variables) => {
      queryClient.setQueryData<Disc[]>(queryKeys.bags.discs(variables.bagId).queryKey, (old) => {
        if (!old) return old;
        return old.filter((disc) => disc._id !== variables._id);
      });
    },
  });
};
