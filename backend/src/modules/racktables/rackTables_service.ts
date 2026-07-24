import { findRackTablesRackById, getRackTablesObjectSummary, getRackTablesRackOccupancy, listRackTablesRacks, RackTablesClientError } from '../../core/rackTablesClient';

export class RackTablesNotFoundError extends Error {}
export class RackTablesUnavailableError extends Error {}

export async function listRackTablesRacksService(search?: string) {
    try {
        const racks = await listRackTablesRacks();
        const normalizedSearch = search?.trim().toLowerCase();

        if (!normalizedSearch) {
            return racks;
        }

        return racks.filter((rack) => [
            rack.name,
            rack.rowCode,
            rack.rackCode,
            rack.locationName,
            String(rack.id),
        ].some((value) => value?.toLowerCase().includes(normalizedSearch)));
    } catch (error) {
        if (error instanceof RackTablesClientError) {
            throw new RackTablesUnavailableError(error.message);
        }

        throw error;
    }
}

export async function findRackTablesRackByIdService(rackId: string) {
    try {
        const rack = await findRackTablesRackById(rackId);

        if (!rack) {
            throw new RackTablesNotFoundError('RackTables rack not found');
        }

        return rack;
    } catch (error) {
        if (error instanceof RackTablesClientError) {
            throw new RackTablesUnavailableError(error.message);
        }

        throw error;
    }
}

export async function getRackTablesRackOccupancyService(rackId: string) {
    try {
        return getRackTablesRackOccupancy(rackId);
    } catch (error) {
        if (error instanceof RackTablesClientError) {
            throw new RackTablesUnavailableError(error.message);
        }

        throw error;
    }
}

export async function getRackTablesObjectSummaryService(objectId: string) {
    try {
        return getRackTablesObjectSummary(objectId);
    } catch (error) {
        if (error instanceof RackTablesClientError) {
            throw new RackTablesUnavailableError(error.message);
        }

        throw error;
    }
}
