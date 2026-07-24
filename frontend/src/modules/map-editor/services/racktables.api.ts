import { apiRequest } from '../../../services/api';

export type RackTablesRackOption = {
  id: number | string;
  name: string;
  rowCode?: string | null;
  rowName?: string | null;
  rackCode?: string | null;
  locationName?: string;
  raw: unknown;
};

export type RackTablesAllocatedObject = {
  object_id?: number | string;
  object_name?: string;
  service_tag?: string | null;
  units?: number[];
  height?: number;
  allocation_status?: string;
};

export type RackTablesObjectSummaryResponse = {
  status?: string;
  message?: string;
  data?: {
    object_id?: number | string;
    common_name?: string | null;
    visible_label?: string | null;
    asset_tag?: string | null;
    has_problems?: boolean | number | null;
    comment?: string | null;
    is_allocated?: boolean;
    rack_id?: number | string | null;
    rack_name?: string | null;
    row_name?: string | null;
    location_name?: string | null;
    rack_count?: number;
    allocation_status?: string;
    attributes?: Record<string, unknown>;
    [key: string]: unknown;
  };
};

export type RackTablesOccupancyResponse = {
  status?: string;
  message?: string;
  data?: {
    rack_id?: number | string;
    rack_name?: string;
    total_units?: number;
    occupied_units?: number[];
    free_units?: number[];
    allocated_objects?: RackTablesAllocatedObject[];
    units?: Array<{
      unit_no: number;
      status: string;
      object?: RackTablesAllocatedObject;
    }>;
  };
};

export const rackTablesApi = {
  listRacks: (search?: string) => apiRequest<RackTablesRackOption[]>('/racktables/racks', { query: { search } }),
  getRack: (rackId: string | number) => apiRequest<RackTablesRackOption>(`/racktables/racks/${rackId}`),
  getRackOccupancy: (rackId: string | number) => apiRequest<RackTablesOccupancyResponse>(`/racktables/racks/${rackId}/occupancy`),
  getObjectSummary: (objectId: string | number) => apiRequest<RackTablesObjectSummaryResponse>(`/racktables/summary/${objectId}`)
};
