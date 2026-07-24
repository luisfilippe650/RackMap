import {
    CreateRackSlotDTO,
    SetRackSlotActiveDTO,
    SetRackSlotCoordinatesDTO,
    SetRackSlotSizeDTO,
    UpdateRackSlotDTO,
} from "./rackSlots_dto";
import {
    createRackSlot,
    deleteRackSlotById,
    findRackSlotById,
    findRackSlotByGlobalId,
    findRackSlotByPosition,
    findRackSlotConflict,
    listRackSlots,
    mapExists,
    setRackSlotActive,
    setRackSlotCoordinates,
    setRackSlotSize,
    updateRackSlot,
    updateRackSlotById,
} from "./rackSlots_repository";

export class RackSlotNotFoundError extends Error {}
export class RackSlotConflictError extends Error {}

async function ensureMapExists(mapId: number) {
    const map = await mapExists(mapId);

    if (!map) {
        throw new RackSlotNotFoundError('Map not found');
    }
}

async function ensureRackSlotExists(mapId: number, slotId: number) {
    const rackSlot = await findRackSlotById(mapId, slotId);

    if (!rackSlot) {
        throw new RackSlotNotFoundError('Rack slot not found');
    }

    return rackSlot;
}

export async function listRackSlotsService(mapId: number) {
    await ensureMapExists(mapId);

    return listRackSlots(mapId);
}

export async function findRackSlotByPositionService(
    mapId: number,
    rowCode: string,
    rackCode: string,
) {
    await ensureMapExists(mapId);

    return findRackSlotByPosition(mapId, rowCode, rackCode);
}

export async function findRackSlotByIdService(rackSlotId: number) {
    const rackSlot = await findRackSlotByGlobalId(rackSlotId);

    if (!rackSlot) {
        throw new RackSlotNotFoundError('Rack slot not found');
    }

    return rackSlot;
}

export async function createRackSlotService(mapId: number, input: CreateRackSlotDTO) {
    await ensureMapExists(mapId);

    const conflict = input.rowCode && input.rackCode
        ? await findRackSlotConflict(mapId, input.rowCode, input.rackCode)
        : null;

    if (conflict) {
        throw new RackSlotConflictError('Rack slot already exists for this rowCode and rackCode');
    }

    return createRackSlot(mapId, input);
}

export async function updateRackSlotService(
    mapId: number,
    slotId: number,
    input: UpdateRackSlotDTO,
) {
    const currentRackSlot = await ensureRackSlotExists(mapId, slotId);
    const nextRowCode = input.rowCode ?? currentRackSlot.normalizedRowCode;
    const nextRackCode = input.rackCode ?? currentRackSlot.rackCode;
    const conflict = nextRowCode && nextRackCode
        ? await findRackSlotConflict(mapId, nextRowCode, nextRackCode, slotId)
        : null;

    if (conflict) {
        throw new RackSlotConflictError('Rack slot already exists for this rowCode and rackCode');
    }

    return updateRackSlot(mapId, slotId, input);
}

export async function updateRackSlotByIdService(rackSlotId: number, input: UpdateRackSlotDTO) {
    const currentRackSlot = await findRackSlotByIdService(rackSlotId);
    const nextRowCode = input.rowCode ?? currentRackSlot.normalizedRowCode;
    const nextRackCode = input.rackCode ?? currentRackSlot.rackCode;
    const conflict = nextRowCode && nextRackCode
        ? await findRackSlotConflict(
            currentRackSlot.mapId,
            nextRowCode,
            nextRackCode,
            rackSlotId,
        )
        : null;

    if (conflict) {
        throw new RackSlotConflictError('Rack slot already exists for this rowCode and rackCode');
    }

    return updateRackSlotById(rackSlotId, input);
}

export async function deleteRackSlotByIdService(rackSlotId: number) {
    await findRackSlotByIdService(rackSlotId);

    return deleteRackSlotById(rackSlotId);
}

export async function setRackSlotCoordinatesService(
    mapId: number,
    slotId: number,
    input: SetRackSlotCoordinatesDTO,
) {
    await ensureRackSlotExists(mapId, slotId);

    return setRackSlotCoordinates(mapId, slotId, input);
}

export async function setRackSlotSizeService(
    mapId: number,
    slotId: number,
    input: SetRackSlotSizeDTO,
) {
    await ensureRackSlotExists(mapId, slotId);

    return setRackSlotSize(mapId, slotId, input);
}

export async function setRackSlotActiveService(
    mapId: number,
    slotId: number,
    input: SetRackSlotActiveDTO,
) {
    await ensureRackSlotExists(mapId, slotId);

    return setRackSlotActive(mapId, slotId, input);
}
