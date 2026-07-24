import { useQuery } from '@tanstack/react-query';
import { rackMapApi } from '../../services/rackmap-api';

export function useRenderedMap(mapId: number) {
  return useQuery({
    queryKey: ['maps', mapId, 'render'],
    queryFn: () => rackMapApi.renderMap(mapId),
    enabled: Number.isFinite(mapId),
    refetchOnMount: 'always'
  });
}
