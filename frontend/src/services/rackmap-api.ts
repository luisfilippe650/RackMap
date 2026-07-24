import type {
  DatacenterMap,
  MapAxis,
  MapElement,
  MapElementType,
  RackSlot,
  RenderedMapResponse
} from '../types/rackmap';
import { apiRequest } from './api';

export type MapInput = {
  name: string;
  description?: string | null;
  width?: number;
  height?: number;
  backgroundColor?: string | null;
  gridEnabled?: boolean;
};

export type AxisInput = {
  code: string;
  label?: string | null;
  sortOrder: number;
  width?: number;
  height?: number;
  visible?: boolean;
};

export type RackSlotInput = {
  rowCode: string;
  rackCode: string;
  positionX: number;
  positionY: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
  label?: string | null;
  active?: boolean;
};

export type ElementInput = {
  type: MapElementType;
  label?: string | null;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
  fillColor?: string | null;
  borderColor?: string | null;
  textColor?: string | null;
  visible?: boolean;
};

export const rackMapApi = {
  listMaps: () => apiRequest<DatacenterMap[]>('/maps'),
  getMap: (mapId: number) => apiRequest<DatacenterMap>(`/maps/${mapId}`),
  createMap: (input: MapInput) => apiRequest<DatacenterMap>('/maps', { method: 'POST', json: input }),
  duplicateMap: (mapId: number) => apiRequest<DatacenterMap>(`/maps/${mapId}/duplicate`, { method: 'POST' }),
  updateMap: (mapId: number, input: Partial<MapInput>) =>
    apiRequest<DatacenterMap>(`/maps/${mapId}`, { method: 'PATCH', json: input }),
  deleteMap: (mapId: number) => apiRequest<void>(`/maps/${mapId}`, { method: 'DELETE' }),

  getAxes: (mapId: number) => apiRequest<{ columns: MapAxis[]; rows: MapAxis[] }>(`/maps/${mapId}/axes`),
  setAxes: (mapId: number, input: { columns: AxisInput[]; rows: AxisInput[] }) =>
    apiRequest<{ columns: MapAxis[]; rows: MapAxis[] }>(`/maps/${mapId}/axes`, { method: 'PUT', json: input }),

  listRackSlots: (mapId: number) => apiRequest<RackSlot[]>(`/maps/${mapId}/rack-slots`),
  createRackSlot: (mapId: number, input: RackSlotInput) =>
    apiRequest<RackSlot>(`/maps/${mapId}/rack-slots`, { method: 'POST', json: input }),
  updateRackSlot: (mapId: number, slotId: number, input: Partial<RackSlotInput>) =>
    apiRequest<RackSlot>(`/maps/${mapId}/rack-slots/${slotId}`, { method: 'PUT', json: input }),
  deleteRackSlot: (slotId: number) => apiRequest<void>(`/rack-slots/${slotId}`, { method: 'DELETE' }),

  listElements: (mapId: number) => apiRequest<MapElement[]>(`/maps/${mapId}/elements`),
  createElement: (mapId: number, input: ElementInput) =>
    apiRequest<MapElement>(`/maps/${mapId}/elements`, { method: 'POST', json: input }),
  updateElement: (mapId: number, elementId: number, input: Partial<ElementInput>) =>
    apiRequest<MapElement>(`/maps/${mapId}/elements/${elementId}`, { method: 'PUT', json: input }),
  deleteElement: (mapId: number, elementId: number) =>
    apiRequest<void>(`/maps/${mapId}/elements/${elementId}`, { method: 'DELETE' }),

  renderMap: (mapId: number) => apiRequest<RenderedMapResponse>(`/maps/${mapId}/render`)
};
