import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rackMapApi, type RackSlotInput } from '../../services/rackmap-api';

export const rackSlotKeys = {
  list: (mapId: number) => ['maps', mapId, 'rack-slots'] as const
};

export function useRackSlots(mapId: number) {
  return useQuery({
    queryKey: rackSlotKeys.list(mapId),
    queryFn: () => rackMapApi.listRackSlots(mapId),
    enabled: Number.isFinite(mapId)
  });
}

export function useCreateRackSlot(mapId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RackSlotInput) => rackMapApi.createRackSlot(mapId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rackSlotKeys.list(mapId) })
  });
}

export function useDeleteRackSlot(mapId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rackMapApi.deleteRackSlot,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rackSlotKeys.list(mapId) })
  });
}
