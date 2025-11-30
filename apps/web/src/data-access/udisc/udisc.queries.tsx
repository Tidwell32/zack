import type { CourseInfo, RoundsResponse } from '@/types';
import { api, createUseQueryHook } from '@/utils';

import { queryKeys } from '../queryKeys';

export interface RoundsQueryParams {
  endDate?: string; // YYYY-MM-DD
  player?: string;
  startDate?: string; // YYYY-MM-DD
}

export const fetchRounds = async (params?: RoundsQueryParams): Promise<RoundsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.player) queryParams.append('player', params.player);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  return api.get<RoundsResponse>(`/udisc/rounds${queryString ? `?${queryString}` : ''}`);
};

export const useRounds = createUseQueryHook<RoundsQueryParams, RoundsResponse>(
  (params) => fetchRounds(params),
  (params) => queryKeys.udisc.rounds(params).queryKey
);

export const fetchPlayers = (): Promise<string[]> => api.get<string[]>('/udisc/players');

export const usePlayers = createUseQueryHook(
  () => fetchPlayers(),
  () => queryKeys.udisc.players.queryKey
);

export const fetchCourses = (): Promise<CourseInfo[]> => api.get<CourseInfo[]>('/udisc/courses');

export const useCourses = createUseQueryHook(
  () => fetchCourses(),
  () => queryKeys.udisc.courses.queryKey
);
