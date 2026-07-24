import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rackMapApi, type AxisInput } from '../../services/rackmap-api';

export const axesKeys = {
  detail: (mapId: number) => ['maps', mapId, 'axes'] as const
};

export function useAxes(mapId: number) {
  return useQuery({
    queryKey: axesKeys.detail(mapId),
    queryFn: () => rackMapApi.getAxes(mapId),
    enabled: Number.isFinite(mapId)
  });
}

export function useSetAxes(mapId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { columns: AxisInput[]; rows: AxisInput[] }) => rackMapApi.setAxes(mapId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: axesKeys.detail(mapId) })
  });
}
