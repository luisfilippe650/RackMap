import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rackMapApi, type ElementInput } from '../../services/rackmap-api';

export const elementKeys = {
  list: (mapId: number) => ['maps', mapId, 'elements'] as const
};

export function useElements(mapId: number) {
  return useQuery({
    queryKey: elementKeys.list(mapId),
    queryFn: () => rackMapApi.listElements(mapId),
    enabled: Number.isFinite(mapId)
  });
}

export function useCreateElement(mapId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ElementInput) => rackMapApi.createElement(mapId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: elementKeys.list(mapId) })
  });
}

export function useDeleteElement(mapId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (elementId: number) => rackMapApi.deleteElement(mapId, elementId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: elementKeys.list(mapId) })
  });
}
