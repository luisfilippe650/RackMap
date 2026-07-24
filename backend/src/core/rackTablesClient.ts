export type RackTablesRack = {
    id: number | string;
    name: string;
    locationId?: number;
    locationName?: string;
    rowId?: number | string | null;
    rowName?: string | null;
    rowCode?: string | null;
    rackCode?: string | null;
    raw: unknown;
};

export class RackTablesClientError extends Error {}

type RackTablesRecord = Record<string, unknown>;

type RackTablesLocationWithRows = {
    locationId: number;
    locationName: string;
    rows: Array<{
        id: number;
        name: string;
    }>;
    raw: unknown;
};

type PaginatedPayload = {
    data?: {
        items?: unknown[];
        total?: number;
        page?: number;
        per_page?: number;
    } | unknown[];
    items?: unknown[];
    racks?: unknown[];
};

const DEFAULT_RACKS_PATH = '/v1/racktables/racks/';
const DEFAULT_LOCATIONS_ROWS_PATH = '/v1/racktables/locations/rows';
const DEFAULT_PER_PAGE = 100;

function asString(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown) {
    const numberValue = typeof value === 'number' ? value : Number(value);

    return Number.isFinite(numberValue) ? numberValue : undefined;
}

function pickString(source: RackTablesRecord, keys: string[]) {
    for (const key of keys) {
        const value = asString(source[key]);

        if (value) {
            return value;
        }
    }

    return undefined;
}

function pickNumber(source: RackTablesRecord, keys: string[]) {
    for (const key of keys) {
        const value = asNumber(source[key]);

        if (value !== undefined) {
            return value;
        }
    }

    return undefined;
}

function getRackTablesBaseUrl() {
    const baseUrl = process.env.RACKTABLES_API_URL ?? 'http://localhost:8000';

    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function buildUrl(path: string, query?: Record<string, string | number | boolean>) {
    const url = new URL(path, getRackTablesBaseUrl());

    for (const [key, value] of Object.entries(query ?? {})) {
        url.searchParams.set(key, String(value));
    }

    return url;
}

async function fetchRackTablesJson(path: string, query?: Record<string, string | number | boolean>) {
    const headers: Record<string, string> = {
        Accept: 'application/json',
    };

    if (process.env.RACKTABLES_API_TOKEN) {
        headers.Authorization = `Bearer ${process.env.RACKTABLES_API_TOKEN}`;
    }

    const response = await fetch(buildUrl(path, query), { headers });

    if (!response.ok) {
        throw new RackTablesClientError(`RackTables request failed with status ${response.status}`);
    }

    return response.json() as Promise<PaginatedPayload>;
}

async function fetchRackTablesRawJson(path: string, query?: Record<string, string | number | boolean>) {
    const headers: Record<string, string> = {
        Accept: 'application/json',
    };

    if (process.env.RACKTABLES_API_TOKEN) {
        headers.Authorization = `Bearer ${process.env.RACKTABLES_API_TOKEN}`;
    }

    const response = await fetch(buildUrl(path, query), { headers });

    if (!response.ok) {
        throw new RackTablesClientError(`RackTables request failed with status ${response.status}`);
    }

    return response.json() as Promise<unknown>;
}

function extractItems(payload: PaginatedPayload) {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload.data)) {
        return payload.data;
    }

    if (Array.isArray(payload.data?.items)) {
        return payload.data.items;
    }

    if (Array.isArray(payload.items)) {
        return payload.items;
    }

    if (Array.isArray(payload.racks)) {
        return payload.racks;
    }

    throw new RackTablesClientError('RackTables response must include an items/data/racks array');
}

async function fetchAllRackTablesItems(path: string) {
    const firstPayload = await fetchRackTablesJson(path, { page: 1, per_page: DEFAULT_PER_PAGE });
    const firstItems = extractItems(firstPayload);
    const total = typeof firstPayload.data === 'object' && !Array.isArray(firstPayload.data)
        ? asNumber(firstPayload.data.total)
        : undefined;

    if (!total || firstItems.length >= total) {
        return firstItems;
    }

    const pages = Math.ceil(total / DEFAULT_PER_PAGE);
    const remainingPages = Array.from({ length: pages - 1 }, (_, index) => index + 2);
    const remainingPayloads = await Promise.all(
        remainingPages.map((page) => fetchRackTablesJson(path, { page, per_page: DEFAULT_PER_PAGE })),
    );

    return [
        ...firstItems,
        ...remainingPayloads.flatMap(extractItems),
    ];
}

function parseRackName(value: string) {
    const match = value.trim().match(/^([A-Za-z]+)\s*[-_ ]?\s*(\d+)$/);

    if (!match) {
        return undefined;
    }

    return {
        rowCode: match[1].toUpperCase(),
        rackCode: match[2],
    };
}

function normalizeRackTablesRack(input: RackTablesRecord): RackTablesRack {
    const id = pickNumber(input, ['rack_id', 'rackId', 'id', 'objectId', 'object_id'])
        ?? pickString(input, ['rack_id', 'rackId', 'id', 'objectId', 'object_id']);
    const name = pickString(input, ['rack_name', 'rackName', 'name', 'label', 'objectName', 'object_name']);

    if (id === undefined || !name) {
        throw new RackTablesClientError('RackTables rack response must include id and name');
    }

    const parsedName = parseRackName(name);
    const rowName = pickString(input, ['row_name', 'rowName', 'row']);

    return {
        id,
        name,
        locationId: pickNumber(input, ['location_id', 'locationId', 'parentId', 'parent_id']),
        locationName: pickString(input, ['location_name', 'locationName', 'location']),
        rowId: pickNumber(input, ['row_id', 'rowId']) ?? pickString(input, ['row_id', 'rowId']) ?? null,
        rowName,
        rowCode: pickString(input, ['row_code', 'rowCode']) ?? rowName ?? parsedName?.rowCode,
        rackCode: pickString(input, ['rack_code', 'rackCode']) ?? parsedName?.rackCode,
        raw: input,
    };
}

function normalizeLocationWithRows(input: RackTablesRecord): RackTablesLocationWithRows {
    const locationId = pickNumber(input, ['location_id', 'locationId', 'id']);
    const locationName = pickString(input, ['location_name', 'locationName', 'name']);
    const rows = Array.isArray(input.rows) ? input.rows : [];

    if (!locationId || !locationName) {
        throw new RackTablesClientError('RackTables location response must include location_id and location_name');
    }

    return {
        locationId,
        locationName,
        rows: rows.map((row) => {
            const rowRecord = row as RackTablesRecord;
            const id = pickNumber(rowRecord, ['id', 'row_id', 'rowId']);
            const name = pickString(rowRecord, ['name', 'row_name', 'rowName']);

            if (!id || !name) {
                throw new RackTablesClientError('RackTables row response must include id and name');
            }

            return { id, name };
        }),
        raw: input,
    };
}

async function listRackTablesLocationsWithRows() {
    const path = process.env.RACKTABLES_LOCATIONS_ROWS_PATH ?? DEFAULT_LOCATIONS_ROWS_PATH;
    const locations = await fetchAllRackTablesItems(path);

    return locations.map((location) => normalizeLocationWithRows(location as RackTablesRecord));
}

export async function listRackTablesRacks() {
    const path = process.env.RACKTABLES_RACKS_PATH ?? DEFAULT_RACKS_PATH;
    const racks = await fetchAllRackTablesItems(path);

    return racks.map((rack) => normalizeRackTablesRack(rack as RackTablesRecord));
}

export async function findRackTablesRackById(rackId: string) {
    const racks = await listRackTablesRacks();

    return racks.find((rack) => String(rack.id) === rackId);
}

export async function getRackTablesRackOccupancy(rackId: string) {
    return fetchRackTablesRawJson(`/v1/racktables/racks/${rackId}/occupancy`, { include_objects: true });
}

export async function getRackTablesObjectSummary(objectId: string) {
    return fetchRackTablesRawJson(`/v1/racktables/summary/${objectId}`);
}

export async function listRackTablesRacksByLocation(locationId: number): Promise<RackTablesRack[]> {
    const [locations, racks] = await Promise.all([
        listRackTablesLocationsWithRows(),
        listRackTablesRacks(),
    ]);
    const location = locations.find((item) => item.locationId === locationId);

    if (!location) {
        throw new RackTablesClientError(`RackTables location ${locationId} was not found`);
    }

    const rowIds = new Set(location.rows.map((row) => row.id));

    return racks
        .filter((rack) => {
            const rackRowId = typeof rack.rowId === 'number' ? rack.rowId : Number(rack.rowId);

            return rowIds.has(rackRowId);
        })
        .map((rack) => ({
            ...rack,
            locationId: location.locationId,
            locationName: location.locationName,
        }));
}
