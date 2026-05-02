import { QueryClient } from '@tanstack/react-query';

/**
 * Single QueryClient for the SPA.
 *
 * - staleTime 30 s: navigating between pages within that window reuses cache;
 *   beyond it the next mount triggers a background refetch (stale-while-revalidate).
 * - retry: 1 — Sanctum 401 / 422 / our 502 should not loop. The axios layer
 *   surfaces 429 as `err.isRateLimited`; queries shouldn't retry those either.
 * - refetchOnWindowFocus disabled — medical app, doesn't need to thrash on
 *   every alt-tab.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        if (error?.isRateLimited) return false;
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
