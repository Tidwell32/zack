import type { ApiError } from '@/utils';
import { api, createUseQueryHook } from '@/utils';

import { queryKeys } from '../queryKeys';

interface MeResponse {
  authenticated: boolean;
  isOwner: boolean;
  sandbox: boolean;
  userId: string | null;
}

const fetchMe = async (): Promise<MeResponse> => {
  try {
    return await api.get<MeResponse>('/auth/whoami');
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 401) {
      return { authenticated: false, userId: null, isOwner: false, sandbox: true };
    }
    throw error;
  }
};

export const useMe = createUseQueryHook(
  () => fetchMe(),
  () => queryKeys.auth.me.queryKey
);
