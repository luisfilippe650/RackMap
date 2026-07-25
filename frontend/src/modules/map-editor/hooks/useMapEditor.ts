import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { mapEditorApi } from '../services/map-editor.api';
import type { MapEditorState } from '../map-editor.types';
import { defaultColumnCode, defaultRowCode } from '../utils/axis-labels';

export function createEmptyEditorState(name = 'Mapa', columnCount = 12, rowCount = 30): MapEditorState {
  return {
    map: { name, description: null, columnCount, rowCount },
    columns: Array.from({ length: columnCount }, (_, index) => ({
      id: crypto.randomUUID(),
      code: defaultColumnCode(index),
      order: index,
      width: 64
    })),
    rows: Array.from({ length: rowCount }, (_, index) => ({
      id: crypto.randomUUID(),
      code: defaultRowCode(index, rowCount),
      order: index,
      height: 32
    })),
    rackSlots: [],
    elements: [],
    networkLinks: [],
    selectedElementIds: [],
    selectedNetworkLinkId: null,
    activeTool: 'SELECT',
    isDirty: false
  };
}

function normalizeLoadedState(state: Awaited<ReturnType<typeof mapEditorApi.getEditor>>): MapEditorState {
  return {
    ...state,
    rackSlots: state.rackSlots.map((slot) => ({
      ...slot,
      id: slot.id ?? crypto.randomUUID(),
      rackName: slot.rackName ?? slot.label ?? slot.rackTablesRackName ?? ([slot.normalizedRowCode, slot.rackCode].filter(Boolean).join('-') || 'Rack'),
      normalizedRowCode: slot.normalizedRowCode ?? null,
      rackCode: slot.rackCode ?? null,
      rackTablesRackId: slot.rackTablesRackId ?? null,
      rackTablesRackName: slot.rackTablesRackName ?? null
    })),
    elements: state.elements.map((element) => ({ ...element, id: element.id ?? crypto.randomUUID() })),
    networkLinks: (state.networkLinks ?? []).map((link) => ({
      ...link,
      id: link.id ?? crypto.randomUUID(),
      name: link.name ?? 'Rede',
      color: link.color ?? '#f59e0b',
      cableType: link.cableType ?? null,
      pathPoints: link.pathPoints ?? []
    })),
    selectedElementIds: [],
    selectedNetworkLinkId: null,
    activeTool: 'SELECT',
    isDirty: false
  };
}

export function useMapEditorQuery(mapId: number) {
  return useQuery({
    queryKey: ['maps', mapId, 'editor'],
    queryFn: async () => normalizeLoadedState(await mapEditorApi.getEditor(mapId)),
    enabled: Number.isFinite(mapId)
  });
}

export function useSaveMapEditor(mapId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (state: MapEditorState) => mapEditorApi.saveEditor(mapId, state),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['maps', mapId, 'editor'] }),
        queryClient.invalidateQueries({ queryKey: ['maps'] }),
        queryClient.invalidateQueries({ queryKey: ['maps', mapId, 'render'] })
      ]);
    }
  });
}

export function useSelectedItems(state: MapEditorState) {
  return useMemo(() => {
    const items = [...state.rackSlots, ...state.elements];
    return items.filter((item) => state.selectedElementIds.includes(item.id));
  }, [state]);
}
