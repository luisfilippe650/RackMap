export type EditorTool = 'SELECT' | 'RACK_SLOT' | 'PDU' | 'WALL' | 'DOOR' | 'CORRIDOR' | 'COLUMN' | 'NETWORK_LINK' | 'ERASER';

export type EditorElementType = Exclude<EditorTool, 'SELECT' | 'NETWORK_LINK' | 'ERASER'>;

export type EditorColumn = {
  id: string;
  code: string;
  order: number;
  width: number;
};

export type EditorRow = {
  id: string;
  code: string;
  order: number;
  height: number;
};

export type GridItemBase = {
  id: string;
  startColumnIndex: number;
  startRowIndex: number;
  columnSpan: number;
  rowSpan: number;
  rotation: number;
  zIndex: number;
  label: string | null;
};

export type RackSlotDraft = GridItemBase & {
  type: 'RACK_SLOT';
  rackName: string;
  normalizedRowCode: string | null;
  rackCode: string | null;
  rackTablesRackId: string | null;
  rackTablesRackName: string | null;
  rackTablesRackData?: unknown;
  fillColor?: string | null;
  borderColor?: string | null;
  textColor?: string | null;
};

export type MapElementDraft = GridItemBase & {
  type: Exclude<EditorElementType, 'RACK_SLOT'>;
  fillColor?: string | null;
  borderColor?: string | null;
  textColor?: string | null;
};

export type MapEditorItem = RackSlotDraft | MapElementDraft;

export type NetworkLinkPoint = {
  x: number;
  y: number;
};

export type NetworkLinkDraft = {
  id: string;
  name: string;
  sourceRackSlotId: string;
  targetRackSlotId: string;
  color: string;
  cableType?: string | null;
  pathPoints: NetworkLinkPoint[];
};

export type MapEditorState = {
  map: {
    id?: number;
    name: string;
    description?: string | null;
    columnCount: number;
    rowCount: number;
  };
  columns: EditorColumn[];
  rows: EditorRow[];
  rackSlots: RackSlotDraft[];
  elements: MapElementDraft[];
  networkLinks: NetworkLinkDraft[];
  selectedElementIds: string[];
  selectedNetworkLinkId: string | null;
  activeTool: EditorTool;
  isDirty: boolean;
};

export type GridCell = {
  columnIndex: number;
  rowIndex: number;
};

export type GridSelection = GridCell & {
  columnSpan: number;
  rowSpan: number;
};
