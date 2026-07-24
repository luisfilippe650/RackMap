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

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function nextDuplicateName(name: string, existingNames: string[]) {
    const duplicatePattern = new RegExp(`^${escapeRegex(name)} \\((\\d+)\\)$`);
    const usedIndexes = new Set<number>();

    for (const existingName of existingNames) {
        const match = existingName.match(duplicatePattern);

        if (match) {
            usedIndexes.add(Number(match[1]));
        }
    }

    let index = 1;

    while (usedIndexes.has(index) || existingNames.includes(`${name} (${index})`)) {
        index += 1;
    }

    return `${name} (${index})`;
}

export function duplicateMap(id: number) {
    return prisma.$transaction(async (tx) => {
        const sourceMap = await tx.datacenterMap.findUnique({
            where: { id },
            include: mapDetailInclude,
        });

        if (!sourceMap) {
            return null;
        }

        const similarMaps = await tx.datacenterMap.findMany({
            where: {
                name: {
                    startsWith: sourceMap.name,
                },
            },
            select: { name: true },
        });
        const newName = nextDuplicateName(sourceMap.name, similarMaps.map((map) => map.name));
        const createdMap = await tx.datacenterMap.create({
            data: {
                name: newName,
                description: sourceMap.description,
                width: sourceMap.width,
                height: sourceMap.height,
                backgroundColor: sourceMap.backgroundColor,
                gridEnabled: sourceMap.gridEnabled,
            },
        });
        const columnIds = new Map<number, number>();
        const rowIds = new Map<number, number>();

        for (const column of sourceMap.columns) {
            const createdColumn = await tx.mapColumn.create({
                data: {
                    mapId: createdMap.id,
                    code: column.code,
                    label: column.label,
                    sortOrder: column.sortOrder,
                    width: column.width,
                    visible: column.visible,
                },
            });
            columnIds.set(column.id, createdColumn.id);
        }

        for (const row of sourceMap.rows) {
            const createdRow = await tx.mapRow.create({
                data: {
                    mapId: createdMap.id,
                    code: row.code,
                    label: row.label,
                    sortOrder: row.sortOrder,
                    height: row.height,
                    visible: row.visible,
                },
            });
            rowIds.set(row.id, createdRow.id);
        }

        for (const slot of sourceMap.rackSlots) {
            await tx.rackSlot.create({
                data: {
                    mapId: createdMap.id,
                    externalRowId: slot.externalRowId,
                    externalRowName: slot.externalRowName,
                    normalizedRowCode: slot.normalizedRowCode,
                    rackCode: slot.rackCode,
                    rackName: slot.rackName,
                    rackTablesRackId: slot.rackTablesRackId,
                    rackTablesRackName: slot.rackTablesRackName,
                    rackTablesRackData: slot.rackTablesRackData === null ? Prisma.JsonNull : slot.rackTablesRackData,
                    mapColumnId: slot.mapColumnId ? columnIds.get(slot.mapColumnId) : undefined,
                    mapRowId: slot.mapRowId ? rowIds.get(slot.mapRowId) : undefined,
                    positionX: slot.positionX,
                    positionY: slot.positionY,
                    width: slot.width,
                    height: slot.height,
                    rotation: slot.rotation,
                    zIndex: slot.zIndex,
                    label: slot.label,
                    fillColor: slot.fillColor,
                    borderColor: slot.borderColor,
                    textColor: slot.textColor,
                    active: slot.active,
                },
            });
        }

        for (const element of sourceMap.elements) {
            await tx.mapElement.create({
                data: {
                    mapId: createdMap.id,
                    type: element.type,
                    label: element.label,
                    customType: element.customType,
                    positionX: element.positionX,
                    positionY: element.positionY,
                    width: element.width,
                    height: element.height,
                    rotation: element.rotation,
                    zIndex: element.zIndex,
                    groupKey: element.groupKey,
                    fillColor: element.fillColor,
                    borderColor: element.borderColor,
                    textColor: element.textColor,
                    visible: element.visible,
                },
            });
        }

        for (const location of sourceMap.sourceLocations) {
            await tx.mapSourceLocation.create({
                data: {
                    mapId: createdMap.id,
                    externalLocationId: location.externalLocationId,
                    externalLocationName: location.externalLocationName,
                    normalizedLocationName: location.normalizedLocationName,
                    active: location.active,
                },
            });
        }

        if (sourceMap.matchingRule) {
            await tx.mapMatchingRule.create({
                data: {
                    mapId: createdMap.id,
                    rackNumberStrategy: sourceMap.matchingRule.rackNumberStrategy,
                    rackNamePattern: sourceMap.matchingRule.rackNamePattern,
                    uppercaseRow: sourceMap.matchingRule.uppercaseRow,
                    trimValues: sourceMap.matchingRule.trimValues,
                    removeSpacesFromRow: sourceMap.matchingRule.removeSpacesFromRow,
                    rackCodePadding: sourceMap.matchingRule.rackCodePadding,
                },
            });
        }

        return tx.datacenterMap.findUniqueOrThrow({
            where: { id: createdMap.id },
            include: mapDetailInclude,
        });
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
    return prisma.$transaction(async (tx) => {
        const map = await tx.datacenterMap.findUnique({ where: { id } });

        if (!map) {
            return null;
        }

        await tx.mapMatchingRule.deleteMany({ where: { mapId: id } });
        await tx.mapSourceLocation.deleteMany({ where: { mapId: id } });
        await tx.rackSlot.deleteMany({ where: { mapId: id } });
        await tx.mapElement.deleteMany({ where: { mapId: id } });
        await tx.mapColumn.deleteMany({ where: { mapId: id } });
        await tx.mapRow.deleteMany({ where: { mapId: id } });

        await tx.datacenterMap.delete({
            where: { id },
        });

        return map;
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
