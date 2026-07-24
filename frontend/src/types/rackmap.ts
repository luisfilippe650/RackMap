export type MapElementType =
  | 'PDU'
  | 'WALL'
  | 'DOOR'
  | 'CORRIDOR'
  | 'COLUMN'
  | 'UPS'
  | 'AIR_CONDITIONER'
  | 'ELECTRICAL_PANEL'
  | 'EMPTY_AREA'
  | 'CUSTOM';

export type DatacenterMap = {
  id: number;
  name: string;
  description: string | null;
  width: number;
  height: number;
  backgroundColor: string | null;
  gridEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
  sourceLocations?: Array<{
    id: number;
    externalLocationId: number;
    externalLocationName: string;
    active: boolean;
  }>;
  columns?: MapAxis[];
  rows?: MapAxis[];
  _count?: {
    sourceLocations?: number;
  };
};

export type MapAxis = {
  id: number;
  mapId: number;
  code: string;
  label: string | null;
  sortOrder: number;
  width?: number;
  height?: number;
  visible: boolean;
};

export type RackSlot = {
  id: number;
  mapId: number;
  normalizedRowCode: string | null;
  rowCode?: string;
  rackCode: string | null;
  rackName: string | null;
  rackTablesRackId: string | null;
  rackTablesRackName: string | null;
  rackTablesRackData?: unknown;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  label: string | null;
  fillColor: string | null;
  borderColor: string | null;
  textColor: string | null;
  active: boolean;
};

export type MapElement = {
  id: number;
  mapId: number;
  type: MapElementType;
  label: string | null;
  customType: string | null;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  groupKey: string | null;
  fillColor: string | null;
  borderColor: string | null;
  textColor: string | null;
  visible: boolean;
  geometry?: Geometry;
};

export type Geometry = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
};

export type RenderedRack = {
  externalRackId: number | string;
  name: string;
  rackCode: string | null;
  rowCode: string | null;
  rackTablesRackId?: string | null;
  rackTablesRackName?: string | null;
  rackTablesRackData?: unknown;
  status: 'MANUAL' | 'LINKED';
  geometry: Geometry;
  label?: string | null;
  fillColor?: string | null;
  borderColor?: string | null;
  textColor?: string | null;
};

export type UnmappedRack = {
  rackTablesId?: number | string;
  rackTablesName?: string;
  name?: string;
  rowCode?: string;
  rackCode?: string;
  message?: string;
};

export type RenderConflict = {
  type: string;
  message?: string;
  rowCode?: string;
  rackCode?: string;
};

export type RenderWarning = {
  type: string;
  message: string;
  rowCode?: string;
  rackCode?: string;
  rackName?: string;
};

export type RenderedMapResponse = {
  map: DatacenterMap;
  racks: RenderedRack[];
  elements: MapElement[];
  unmappedRacks: UnmappedRack[];
  conflicts: RenderConflict[];
  warnings?: RenderWarning[];
};
