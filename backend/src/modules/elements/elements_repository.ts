import { prisma } from "../../core/prisma";
import type { MapElement } from "../../generated/prisma/client";
import {
    CreateElementDTO,
    GroupWallElementsDTO,
    ListElementsDTO,
    SetElementAppearanceDTO,
    SetElementPositionDTO,
    SetElementRotationDTO,
    SetElementSizeDTO,
    UpdateElementDTO,
} from "./elements_dto";

export function mapExists(mapId: number) {
    return prisma.datacenterMap.findUnique({
        where: { id: mapId },
        select: { id: true },
    });
}

export function listElements(mapId: number, filters: ListElementsDTO) {
    return prisma.mapElement.findMany({
        where: {
            mapId,
            type: filters.type,
            groupKey: filters.groupKey,
            visible: filters.visible,
        },
        orderBy: [
            { zIndex: 'asc' },
            { id: 'asc' },
        ],
    });
}

export function findElementById(mapId: number, elementId: number) {
    return prisma.mapElement.findFirst({
        where: {
            id: elementId,
            mapId,
        },
    });
}

export function findElementByGlobalId(elementId: number) {
    return prisma.mapElement.findUnique({
        where: { id: elementId },
    });
}

export function findElementsByIds(mapId: number, elementIds: number[]): Promise<MapElement[]> {
    return prisma.mapElement.findMany({
        where: {
            mapId,
            id: { in: elementIds },
        },
    });
}

export function createElement(mapId: number, input: CreateElementDTO) {
    return prisma.mapElement.create({
        data: {
            ...input,
            mapId,
        },
    });
}

export function updateElement(mapId: number, elementId: number, input: UpdateElementDTO) {
    return prisma.mapElement.update({
        where: {
            id: elementId,
            mapId,
        },
        data: input,
    });
}

export function updateElementById(elementId: number, input: UpdateElementDTO) {
    return prisma.mapElement.update({
        where: { id: elementId },
        data: input,
    });
}

export function deleteElement(mapId: number, elementId: number) {
    return prisma.mapElement.delete({
        where: {
            id: elementId,
            mapId,
        },
    });
}

export function deleteElementById(elementId: number) {
    return prisma.mapElement.delete({
        where: { id: elementId },
    });
}

export function setElementPosition(
    mapId: number,
    elementId: number,
    input: SetElementPositionDTO,
) {
    return prisma.mapElement.update({
        where: {
            id: elementId,
            mapId,
        },
        data: input,
    });
}

export function setElementSize(mapId: number, elementId: number, input: SetElementSizeDTO) {
    return prisma.mapElement.update({
        where: {
            id: elementId,
            mapId,
        },
        data: input,
    });
}

export function setElementRotation(
    mapId: number,
    elementId: number,
    input: SetElementRotationDTO,
) {
    return prisma.mapElement.update({
        where: {
            id: elementId,
            mapId,
        },
        data: input,
    });
}

export function setElementAppearance(
    mapId: number,
    elementId: number,
    input: SetElementAppearanceDTO,
) {
    return prisma.mapElement.update({
        where: {
            id: elementId,
            mapId,
        },
        data: input,
    });
}

export function groupWallElements(mapId: number, input: GroupWallElementsDTO) {
    return prisma.$transaction(async (tx) => {
        await tx.mapElement.updateMany({
            where: {
                mapId,
                id: { in: input.elementIds },
                type: 'WALL',
            },
            data: {
                groupKey: input.groupKey,
            },
        });

        return tx.mapElement.findMany({
            where: {
                mapId,
                groupKey: input.groupKey,
            },
            orderBy: [
                { zIndex: 'asc' },
                { id: 'asc' },
            ],
        });
    });
}
