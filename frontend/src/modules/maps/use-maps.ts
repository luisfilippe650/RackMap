import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rackMapApi, type MapInput } from '../../services/rackmap-api';

export const mapsKeys = {
  all: ['maps'] as const,
  detail: (mapId: number) => ['maps', mapId] as const
};

export function useMaps() {
  return useQuery({
    queryKey: mapsKeys.all,
    queryFn: rackMapApi.listMaps
  });
}

export function useMap(mapId: number) {
  return useQuery({
    queryKey: mapsKeys.detail(mapId),
    queryFn: () => rackMapApi.getMap(mapId),
    enabled: Number.isFinite(mapId)
  });
}

export function useCreateMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MapInput) => rackMapApi.createMap(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mapsKeys.all })
  });
}

export function useUpdateMap(mapId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<MapInput>) => rackMapApi.updateMap(mapId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapsKeys.all });
      queryClient.invalidateQueries({ queryKey: mapsKeys.detail(mapId) });
    }
  });
}

export function useDeleteMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rackMapApi.deleteMap,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mapsKeys.all })
  });
}

export function useDuplicateMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rackMapApi.duplicateMap,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mapsKeys.all })
  });
}
