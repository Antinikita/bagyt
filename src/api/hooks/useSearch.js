import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { searchChats } from '../search';

export const searchKeys = {
  results: (q, mode) => ['search', mode, q],
};

export function useSearchChats(q, mode = 'hybrid', limit = 20) {
  const trimmed = (q ?? '').trim();
  return useQuery({
    queryKey: searchKeys.results(trimmed, mode),
    queryFn: () => searchChats(trimmed, mode, limit),
    enabled: trimmed.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
