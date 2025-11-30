import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CourseInfo, ImportUDiscResponse, RoundsResponse } from '@/types';
import { api } from '@/utils';

import { queryKeys } from '../queryKeys';

const importUDiscCsv = async ({ file }: { file: File }): Promise<ImportUDiscResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<ImportUDiscResponse>('/udisc/import', formData);
};

export const useImportUDiscCsv = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importUDiscCsv,
    onSuccess: ({ courses, rounds, players, primaryPlayer }) => {
      queryClient.setQueryData<RoundsResponse>(queryKeys.udisc.rounds({}).queryKey, { primaryPlayer, rounds });
      queryClient.setQueryData<string[]>(queryKeys.udisc.players.queryKey, players);
      queryClient.setQueryData<CourseInfo[]>(queryKeys.udisc.courses.queryKey, courses);
    },
  });
};
