import { apiRequest } from '../../../services/api';
import type { MapEditorState } from '../map-editor.types';

type SaveEditorPayload = Omit<MapEditorState, 'selectedElementIds' | 'selectedNetworkLinkId' | 'activeTool' | 'isDirty'>;

export const mapEditorApi = {
  getEditor: (mapId: number) => apiRequest<SaveEditorPayload>(`/maps/${mapId}/editor`),
  saveEditor: (mapId: number, state: MapEditorState) =>
    apiRequest<SaveEditorPayload>(`/maps/${mapId}/editor`, {
      method: 'PUT',
      json: {
        map: state.map,
        columns: state.columns,
        rows: state.rows,
        rackSlots: state.rackSlots.map(({ type: _type, ...slot }) => slot),
        elements: state.elements.map(({ id: _id, ...element }) => element),
        networkLinks: state.networkLinks
      }
    })
};
