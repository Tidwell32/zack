import { createQueryKeyStore } from '@lukemorales/query-key-factory';

import type { SuggestDiscsProps } from './catalog/catalog.queries';

export const queryKeys = createQueryKeyStore({
  auth: {
    me: null,
  },
  bags: {
    me: null,
    detail: (id: string) => [id],
    discs: (bagId?: string) => [bagId],
  },
  discs: {
    detail: (id: string) => [id],
  },
  catalog: {
    search: (q: string, limit: number) => [q, limit],
    suggest: (props: SuggestDiscsProps) => [props],
  },
  techdisc: {
    throws: (params?: { date?: string; endDate?: string; startDate?: string }) => [params],
    sessions: (params?: { date?: string; endDate?: string; startDate?: string }) => [params],
  },
  udisc: {
    rounds: (params?: { endDate?: string; player?: string; startDate?: string }) => [params],
    players: null,
    courses: null,
  },
});
