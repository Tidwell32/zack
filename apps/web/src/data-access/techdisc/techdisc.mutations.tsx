import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ImportTechDiscCSVInput, ImportTechDiscCSVResponse, Throw } from '@/types';
import { api } from '@/utils';

import { queryKeys } from '../queryKeys';

const importTechDiscCsv = async ({ file, handedness }: ImportTechDiscCSVInput): Promise<ImportTechDiscCSVResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (handedness) {
    formData.append('handedness', handedness);
  }
  return api.post<ImportTechDiscCSVResponse>('/techdisc/import', formData);
};

export const useImportTechDiscCsv = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importTechDiscCsv,
    onSuccess: ({ throws }) => {
      queryClient.setQueryData<Throw[]>(queryKeys.techdisc.throws({}).queryKey, throws);
    },
  });
};
