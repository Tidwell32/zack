import type { Session, Throw } from '@/types';
import { api, createUseQueryHook } from '@/utils';

import { queryKeys } from '../queryKeys';

export interface ThrowsQueryParams {
  date?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  startDate?: string; // YYYY-MM-DD
}

export const fetchThrows = async (params?: ThrowsQueryParams): Promise<Throw[]> => {
  const queryParams = new URLSearchParams();
  if (params?.date) queryParams.append('date', params.date);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  return api.get<Throw[]>(`/techdisc/throws${queryString ? `?${queryString}` : ''}`);
};

export const useThrows = createUseQueryHook<ThrowsQueryParams, Throw[]>(
  (params) => fetchThrows(params),
  (params) => queryKeys.techdisc.throws(params).queryKey
);

export interface SessionsQueryParams {
  date?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  startDate?: string; // YYYY-MM-DD
}

export const fetchSessions = async (params?: SessionsQueryParams): Promise<Session[]> => {
  const queryParams = new URLSearchParams();
  if (params?.date) queryParams.append('date', params.date);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  return api.get<Session[]>(`/techdisc/sessions${queryString ? `?${queryString}` : ''}`);
};

export const useSessions = createUseQueryHook<SessionsQueryParams, Session[]>(
  (params) => fetchSessions(params),
  (params) => queryKeys.techdisc.sessions(params).queryKey
);
