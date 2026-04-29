import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  listAnamneses, getAnamnesis, updateAnamnesis, deleteAnamnesis, generateFromChat,
} from '../anamneses';

export const anamnesesKeys = {
  all: ['anamneses'],
  list: (params) => ['anamneses', params],
  detail: (id) => ['anamnesis', id],
};

export function useAnamnesesList({ page = 1, perPage = 20 } = {}) {
  return useQuery({
    queryKey: anamnesesKeys.list({ page, perPage }),
    queryFn: () => listAnamneses({ page, perPage }),
    placeholderData: keepPreviousData,
  });
}

export function useAnamnesis(id) {
  return useQuery({
    queryKey: anamnesesKeys.detail(id),
    queryFn: () => getAnamnesis(id),
    enabled: Boolean(id),
  });
}

export function useUpdateAnamnesis(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch) => updateAnamnesis(id, patch),
    onSuccess: (data) => {
      qc.setQueryData(anamnesesKeys.detail(id), data);
      qc.invalidateQueries({ queryKey: anamnesesKeys.all });
    },
  });
}

export function useDeleteAnamnesis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteAnamnesis(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: anamnesesKeys.all });
      qc.removeQueries({ queryKey: anamnesesKeys.detail(id) });
    },
  });
}

export function useGenerateAnamnesis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, locale }) => generateFromChat(chatId, locale),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: anamnesesKeys.all });
    },
  });
}
