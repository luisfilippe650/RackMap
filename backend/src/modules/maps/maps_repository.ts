import { prisma } from "../../core/prisma";
import { Prisma } from "../../generated/prisma/client";
import {
    AssociateRackTablesLocationsDTO,
    ConfigureNormalizationRulesDTO,
    CreateSourceLocationDTO,
    CreateMapDTO,
    ListMapsDTO,
    SetMapDimensionsDTO,
    UpdateMapDTO,
} from "./maps_dto";


const mapListInclude: Prisma.DatacenterMapInclude = {
    sourceLocations: true,
    matchingRule: true,
};

const mapDetailInclude: Prisma.DatacenterMapInclude = {
    sourceLocations: {
        orderBy: { externalLocationName: 'asc' },
    },
    columns: {
        orderBy: { sortOrder: 'asc' },
    },
    rows: {
        orderBy: { sortOrder: 'asc' },
    },
    rackSlots: {
        orderBy: [{ normalizedRowCode: 'asc' }, { rackCode: 'asc' }],
    },
    elements: {
        orderBy: [{ zIndex: 'asc' }, { id: 'asc' }],
    },
    matchingRule: true,
};


export function createMap(map: CreateMapDTO) {
    return prisma.datacenterMap.create({
        data: map,
        include: mapDetailInclude,
    });
}


export function listMaps(filters: ListMapsDTO) {
    const where = filters.search
        ? {
            OR: [
                { name: { contains: filters.search } },
                { description: { contains: filters.search } },
            ],
        }
        : undefined;

    return prisma.datacenterMap.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: { createdAt: 'desc' },
        include: mapListInclude,
    });
}


export function findMapById(id: number) {
    return prisma.datacenterMap.findUnique({
        where: { id },
        include: mapDetailInclude,
    });
}

export function findMapForRendering(id: number) {
    return prisma.datacenterMap.findUnique({
        where: { id },
        include: {
            sourceLocations: {
                where: { active: true },
                orderBy: { externalLocationName: 'asc' },
            },
            columns: {
                where: { visible: true },
                orderBy: { sortOrder: 'asc' },
            },
            rows: {
                where: { visible: true },
                orderBy: { sortOrder: 'asc' },
            },
            matchingRule: true,
        },
    });
}

export function listSourceLocations(mapId: number) {
    return prisma.mapSourceLocation.findMany({
        where: { mapId },
        orderBy: { externalLocationName: 'asc' },
    });
}

export function createSourceLocation(mapId: number, location: CreateSourceLocationDTO) {
    return prisma.mapSourceLocation.upsert({
        where: {
            mapId_externalLocationId: {
                mapId,
                externalLocationId: location.externalLocationId,
            },
        },
        create: {
            mapId,
            externalLocationId: location.externalLocationId,
            externalLocationName: location.externalLocationName,
            normalizedLocationName: location.normalizedLocationName ?? location.externalLocationName,
            active: location.active ?? true,
        },
        update: {
            externalLocationName: location.externalLocationName,
            normalizedLocationName: location.normalizedLocationName ?? location.externalLocationName,
            active: location.active ?? true,
        },
    });
}

export function deleteSourceLocation(mapId: number, sourceLocationId: number) {
    return prisma.mapSourceLocation.delete({
        where: {
            id: sourceLocationId,
            mapId,
        },
    });
}


export function updateMap(id: number, map: UpdateMapDTO) {
    return prisma.datacenterMap.update({
        where: { id },
        data: map,
        include: mapDetailInclude,
    });
}


export function deleteMap(id: number) {
    return prisma.datacenterMap.delete({
        where: { id },
    });
}


export function setMapDimensions(id: number, dimensions: SetMapDimensionsDTO) {
    return prisma.datacenterMap.update({
        where: { id },
        data: dimensions,
        include: mapDetailInclude,
    });
}


export function associateRackTablesLocations(mapId: number, input: AssociateRackTablesLocationsDTO) {
    const externalLocationIds = input.locations.map((location) => location.externalLocationId);

    return prisma.$transaction(async (tx) => {
        await tx.datacenterMap.findUniqueOrThrow({
            where: { id: mapId },
        });

        if (input.deactivateMissing) {
            await tx.mapSourceLocation.updateMany({
                where: {
                    mapId,
                    externalLocationId: { notIn: externalLocationIds },
                },
                data: { active: false },
            });
        }

        for (const location of input.locations) {
            await tx.mapSourceLocation.upsert({
                where: {
                    mapId_externalLocationId: {
                        mapId,
                        externalLocationId: location.externalLocationId,
                    },
                },
                create: {
                    mapId,
                    externalLocationId: location.externalLocationId,
                    externalLocationName: location.externalLocationName,
                    normalizedLocationName: location.normalizedLocationName ?? location.externalLocationName,
                    active: location.active ?? true,
                },
                update: {
                    externalLocationName: location.externalLocationName,
                    normalizedLocationName: location.normalizedLocationName ?? location.externalLocationName,
                    active: location.active ?? true,
                },
            });
        }

        return tx.datacenterMap.findUniqueOrThrow({
            where: { id: mapId },
            include: mapDetailInclude,
        });
    });
}


export function configureNormalizationRules(mapId: number, rules: ConfigureNormalizationRulesDTO) {
    return prisma.mapMatchingRule.upsert({
        where: { mapId },
        create: {
            mapId,
            ...rules,
        },
        update: rules,
    });
}
