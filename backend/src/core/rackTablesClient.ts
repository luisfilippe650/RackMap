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

type RackTablesRackResponse = Record<string, unknown>;

const DEFAULT_RACKS_PATH_TEMPLATE = '/locations/{locationId}/racks';

function asString(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown) {
    const numberValue = typeof value === 'number' ? value : Number(value);

    return Number.isFinite(numberValue) ? numberValue : undefined;
}

function pickString(source: RackTablesRackResponse, keys: string[]) {
    for (const key of keys) {
        const value = asString(source[key]);

        if (value) {
            return value;
        }
    }

    return undefined;
}

function pickNumber(source: RackTablesRackResponse, keys: string[]) {
    for (const key of keys) {
        const value = asNumber(source[key]);

        if (value !== undefined) {
            return value;
        }
    }

    return undefined;
}

function normalizeRackTablesRack(input: RackTablesRackResponse): RackTablesRack {
    const id = pickString(input, ['id', 'rackId', 'rack_id', 'objectId', 'object_id'])
        ?? pickNumber(input, ['id', 'rackId', 'rack_id', 'objectId', 'object_id']);
    const name = pickString(input, ['name', 'rackName', 'rack_name', 'label', 'objectName', 'object_name']);

    if (id === undefined || !name) {
        throw new RackTablesClientError('RackTables rack response must include id and name');
    }

    return {
        id,
        name,
        locationId: pickNumber(input, ['locationId', 'location_id', 'parentId', 'parent_id']),
        locationName: pickString(input, ['locationName', 'location_name', 'location']),
        rowId: pickString(input, ['rowId', 'row_id']) ?? pickNumber(input, ['rowId', 'row_id']) ?? null,
        rowName: pickString(input, ['rowName', 'row_name', 'row']),
        rowCode: pickString(input, ['rowCode', 'row_code']),
        rackCode: pickString(input, ['rackCode', 'rack_code']),
        raw: input,
    };
}

export async function listRackTablesRacksByLocation(locationId: number): Promise<RackTablesRack[]> {
    const baseUrl = process.env.RACKTABLES_API_URL;

    if (!baseUrl) {
        throw new RackTablesClientError('RACKTABLES_API_URL is not defined');
    }

    const pathTemplate = process.env.RACKTABLES_RACKS_PATH_TEMPLATE ?? DEFAULT_RACKS_PATH_TEMPLATE;
    const path = pathTemplate.replace('{locationId}', String(locationId));
    const url = new URL(path, baseUrl);
    const headers: Record<string, string> = {
        Accept: 'application/json',
    };

    if (process.env.RACKTABLES_API_TOKEN) {
        headers.Authorization = `Bearer ${process.env.RACKTABLES_API_TOKEN}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
        throw new RackTablesClientError(`RackTables request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const racks: unknown[] | undefined = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.racks)
            ? payload.racks
            : Array.isArray(payload?.data)
                ? payload.data
                : undefined;

    if (!racks) {
        throw new RackTablesClientError('RackTables response must be an array or include racks/data array');
    }

    return racks.map((rack: unknown) => normalizeRackTablesRack(rack as RackTablesRackResponse));
}
