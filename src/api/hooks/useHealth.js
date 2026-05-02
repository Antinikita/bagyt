import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHealthSummary, listHealthMetrics, postHealthMetrics, getHealthNorms } from '../health';

export const healthKeys = {
  all: ['health'],
  summary: (date) => ['health', 'summary', date ?? 'today'],
  metrics: (filters) => ['health', 'metrics', filters],
  norms: ['health', 'norms'],
};

export function useHealthSummary(date = null) {
  return useQuery({
    queryKey: healthKeys.summary(date),
    queryFn: () => getHealthSummary(date),
  });
}

export function useHealthMetrics(filters = {}) {
  return useQuery({
    queryKey: healthKeys.metrics(filters),
    queryFn: () => listHealthMetrics(filters),
  });
}

export function usePostHealthMetrics() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (metrics) => postHealthMetrics(metrics),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: healthKeys.all });
    },
  });
}

export function useHealthNorms() {
  return useQuery({
    queryKey: healthKeys.norms,
    queryFn: getHealthNorms,
    // Norms key on user.age + user.sex which only change via Profile
    // edit; safe to cache for the whole session.
    staleTime: 60 * 60 * 1000,
  });
}
