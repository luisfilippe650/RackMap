import { prisma } from "../../core/prisma";
import {
    CreateRackSlotDTO,
    SetRackSlotActiveDTO,
    SetRackSlotCoordinatesDTO,
    SetRackSlotSizeDTO,
    UpdateRackSlotDTO,
} from "./rackSlots_dto";

function toCreateRackSlotData(input: CreateRackSlotDTO) {
    const { rowCode, ...data } = input;

    return {
        ...data,
        normalizedRowCode: rowCode,
    };
}

function toUpdateRackSlotData(input: UpdateRackSlotDTO) {
    const { rowCode, ...data } = input;

    return {
        ...data,
        normalizedRowCode: rowCode ?? undefined,
    };
}

export function mapExists(mapId: number) {
    return prisma.datacenterMap.findUnique({
        where: { id: mapId },
        select: { id: true },
    });
}

export function listRackSlots(mapId: number) {
    return prisma.rackSlot.findMany({
        where: { mapId },
        orderBy: [
            { normalizedRowCode: 'asc' },
            { rackCode: 'asc' },
        ],
    });
}

export function findRackSlotById(mapId: number, slotId: number) {
    return prisma.rackSlot.findFirst({
        where: {
            id: slotId,
            mapId,
        },
    });
}

export function findRackSlotByPosition(mapId: number, rowCode: string, rackCode: string) {
    return prisma.rackSlot.findUnique({
        where: {
            mapId_normalizedRowCode_rackCode: {
                mapId,
                normalizedRowCode: rowCode,
                rackCode,
            },
        },
    });
}

export function findRackSlotConflict(
    mapId: number,
    rowCode: string,
    rackCode: string,
    ignoredSlotId?: number,
) {
    return prisma.rackSlot.findFirst({
        where: {
            mapId,
            normalizedRowCode: rowCode,
            rackCode,
            id: ignoredSlotId ? { not: ignoredSlotId } : undefined,
        },
    });
}

export function createRackSlot(mapId: number, input: CreateRackSlotDTO) {
    return prisma.rackSlot.create({
        data: {
            ...toCreateRackSlotData(input),
            mapId,
        },
    });
}

export function updateRackSlot(mapId: number, slotId: number, input: UpdateRackSlotDTO) {
    return prisma.rackSlot.update({
        where: {
            id: slotId,
            mapId,
        },
        data: toUpdateRackSlotData(input),
    });
}

export function setRackSlotCoordinates(
    mapId: number,
    slotId: number,
    input: SetRackSlotCoordinatesDTO,
) {
    return prisma.rackSlot.update({
        where: {
            id: slotId,
            mapId,
        },
        data: input,
    });
}

export function setRackSlotSize(mapId: number, slotId: number, input: SetRackSlotSizeDTO) {
    return prisma.rackSlot.update({
        where: {
            id: slotId,
            mapId,
        },
        data: input,
    });
}

export function setRackSlotActive(mapId: number, slotId: number, input: SetRackSlotActiveDTO) {
    return prisma.rackSlot.update({
        where: {
            id: slotId,
            mapId,
        },
        data: {
            active: input.active,
        },
    });
}
