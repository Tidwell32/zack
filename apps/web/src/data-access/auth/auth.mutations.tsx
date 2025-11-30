import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/utils';

import { queryKeys } from '../queryKeys';

interface LoginInput {
  code: string;
}

const login = async ({ code }: LoginInput): Promise<void> => {
  await api.post('/auth/login', { code });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me.queryKey });
    },
  });
};

const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me.queryKey });
    },
  });
};
