import type { CatalogDisc } from '@/types';
import { api, createUseQueryHook } from '@/utils';

import { queryKeys } from '../queryKeys';

interface SearchDiscsProps {
  limit?: number;
  q: string;
}

export interface SuggestDiscsProps {
  limit?: number;
  maxSpeed?: number;
  maxStability?: number;
  minSpeed?: number;
  minStability?: number;
}

const searchDiscs = async ({ q, limit = 20 }: SearchDiscsProps): Promise<CatalogDisc[]> =>
  api.get<CatalogDisc[]>(`/catalog/discs/search?q=${encodeURIComponent(q)}&limit=${limit}`);

export const useSearchDiscs = createUseQueryHook<SearchDiscsProps, CatalogDisc[]>(
  searchDiscs,
  ({ q, limit }) => queryKeys.catalog.search(q, limit ?? 50).queryKey,
  ({ q }) => q.length > 0
);

const suggestDiscs = async ({
  limit = 20,
  maxSpeed = 14,
  maxStability = 4,
  minSpeed = 1,
  minStability = -5,
}: SuggestDiscsProps): Promise<CatalogDisc[]> =>
  api.get<CatalogDisc[]>(
    `/catalog/discs/suggest?limit=${limit}&minSpeed=${minSpeed}&maxSpeed=${maxSpeed}&minStability=${minStability}&maxStability=${maxStability}`
  );

export const useSuggestDiscs = createUseQueryHook<SuggestDiscsProps, CatalogDisc[]>(
  suggestDiscs,
  (props) => queryKeys.catalog.suggest(props).queryKey
);
