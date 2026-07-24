import { RackNumberStrategy } from "../../generated/prisma/enums";
import { listRackTablesRacksByLocation, RackTablesClientError, RackTablesRack } from "../../core/rackTablesClient";
import { listElements } from "../elements/elements_repository";
import { findMapForRendering } from "../maps/maps_repository";
import { listActiveRackSlots } from "../rack-slots/rackSlots_repository";
import { RenderMapDTO } from "./rendering_dto";

type MatchingRule = NonNullable<Awaited<ReturnType<typeof findMapForRendering>>>['matchingRule'];
type RackSlot = Awaited<ReturnType<typeof listActiveRackSlots>>[number];
type SourceLocation = NonNullable<Awaited<ReturnType<typeof findMapForRendering>>>['sourceLocations'][number];

type NormalizedRack = {
    rackTablesId: number | string;
    rackTablesName: string;
    location: {
        externalLocationId: number;
        externalLocationName: string;
        normalizedLocationName: string;
    };
    rowCode: string;
    rackCode: string;
    rowId?: number | string | null;
    rowName?: string | null;
    raw?: unknown;
};

type InvalidRack = {
    type: 'MISSING_RACK_ROW';
    message: string;
    rackTablesId: number | string;
    rackTablesName: string;
    location: {
        externalLocationId: number;
        externalLocationName: string;
        normalizedLocationName: string;
    };
    raw?: unknown;
};

type RenderingConflict = {
    type: 'MISSING_RACK_ROW' | 'DYNAMIC_RACK_SLOT_CONFLICT';
    message?: string;
    rack?: InvalidRack;
    rowCode?: string;
    rackCode?: string;
    rackSlotId?: number;
    racks?: NormalizedRack[];
};

export class RenderingNotFoundError extends Error {}
export class RenderingDependencyError extends Error {}

function isInvalidRack(rack: NormalizedRack | InvalidRack): rack is InvalidRack {
    return 'type' in rack && rack.type === 'MISSING_RACK_ROW';
}

function normalizeValue(value: string, matchingRule: MatchingRule) {
    let normalizedValue = matchingRule?.trimValues === false ? value : value.trim();

    if (matchingRule?.uppercaseRow !== false) {
        normalizedValue = normalizedValue.toUpperCase();
    }

    if (matchingRule?.removeSpacesFromRow) {
        normalizedValue = normalizedValue.replace(/\s+/g, '');
    }

    return normalizedValue;
}

function normalizeRackCode(value: string, matchingRule: MatchingRule) {
    const trimmedValue = matchingRule?.trimValues === false ? value : value.trim();
    const paddedValue = matchingRule?.rackCodePadding
        ? trimmedValue.padStart(matchingRule.rackCodePadding, '0')
        : trimmedValue;

    return paddedValue.toUpperCase();
}

function rackSlotKey(rowCode: string, rackCode: string) {
    return `${rowCode}::${rackCode}`;
}

function normalizedRackSlotKey(rackSlot: RackSlot, matchingRule: MatchingRule) {
    return rackSlotKey(
        normalizeValue(rackSlot.normalizedRowCode, matchingRule),
        normalizeRackCode(rackSlot.rackCode, matchingRule),
    );
}

function extractRackCode(rack: RackTablesRack, matchingRule: MatchingRule) {
    if (rack.rackCode) {
        return normalizeRackCode(rack.rackCode, matchingRule);
    }

    const strategy = matchingRule?.rackNumberStrategy ?? RackNumberStrategy.TRAILING_NUMBER;
    const rackName = matchingRule?.trimValues === false ? rack.name : rack.name.trim();

    if (strategy === RackNumberStrategy.FULL_NAME) {
        return normalizeRackCode(rackName, matchingRule);
    }

    if (strategy === RackNumberStrategy.REGEX && matchingRule?.rackNamePattern) {
        const match = rackName.match(new RegExp(matchingRule.rackNamePattern));
        const value = match?.[1] ?? match?.[0];

        if (value) {
            return normalizeRackCode(value, matchingRule);
        }
    }

    const trailingNumber = rackName.match(/(\d+)$/)?.[1];

    return normalizeRackCode(trailingNumber ?? rackName, matchingRule);
}

function normalizeRack(
    rack: RackTablesRack,
    sourceLocation: SourceLocation,
    matchingRule: MatchingRule,
    includeRawRackTablesData: boolean,
): NormalizedRack | InvalidRack {
    const location = {
        externalLocationId: sourceLocation.externalLocationId,
        externalLocationName: sourceLocation.externalLocationName,
        normalizedLocationName: normalizeValue(sourceLocation.normalizedLocationName, matchingRule),
    };
    const rowValue = rack.rowCode ?? rack.rowName;

    if (!rowValue) {
        return {
            type: 'MISSING_RACK_ROW',
            message: 'RackTables rack is missing rowCode/rowName. Location cannot be used as row.',
            rackTablesId: rack.id,
            rackTablesName: rack.name,
            location,
            raw: includeRawRackTablesData ? rack.raw : undefined,
        };
    }

    return {
        rackTablesId: rack.id,
        rackTablesName: rack.name,
        location,
        rowCode: normalizeValue(rowValue, matchingRule),
        rackCode: extractRackCode(rack, matchingRule),
        rowId: rack.rowId,
        rowName: rack.rowName,
        raw: includeRawRackTablesData ? rack.raw : undefined,
    };
}

function toRenderableRack(rack: NormalizedRack, rackSlot: RackSlot) {
    return {
        kind: 'rack',
        externalRackId: rack.rackTablesId,
        name: rack.rackTablesName,
        rackTablesId: rack.rackTablesId,
        rackTablesName: rack.rackTablesName,
        location: {
            id: rack.location.externalLocationId,
            name: rack.location.externalLocationName,
            normalizedName: rack.location.normalizedLocationName,
        },
        row: {
            id: rack.rowId,
            name: rack.rowName ?? rack.rowCode,
            code: rack.rowCode,
        },
        rowCode: rack.rowCode,
        rackCode: rack.rackCode,
        status: 'MAPPED',
        raw: rack.raw,
        slot: rackSlot,
        geometry: {
            x: rackSlot.positionX,
            y: rackSlot.positionY,
            width: rackSlot.width,
            height: rackSlot.height,
            rotation: rackSlot.rotation,
            zIndex: rackSlot.zIndex,
        },
        positionX: rackSlot.positionX,
        positionY: rackSlot.positionY,
        width: rackSlot.width,
        height: rackSlot.height,
        rotation: rackSlot.rotation,
        zIndex: rackSlot.zIndex,
        label: rackSlot.label ?? rack.rackTablesName,
    };
}

function toRenderableElement(element: Awaited<ReturnType<typeof listElements>>[number]) {
    return {
        kind: 'element',
        ...element,
        geometry: {
            x: element.positionX,
            y: element.positionY,
            width: element.width,
            height: element.height,
            rotation: element.rotation,
            zIndex: element.zIndex,
        },
    };
}

export async function renderMapService(mapId: number, input: RenderMapDTO) {
    const map = await findMapForRendering(mapId);

    if (!map) {
        throw new RenderingNotFoundError('Map not found');
    }

    const [rackSlots, elements] = await Promise.all([
        listActiveRackSlots(mapId),
        listElements(mapId, { visible: true }),
    ]);
    const rackSlotByPosition = new Map(
        rackSlots.map((rackSlot) => [
            normalizedRackSlotKey(rackSlot, map.matchingRule),
            rackSlot,
        ]),
    );
    const normalizedRacks: NormalizedRack[] = [];
    const invalidRacks: InvalidRack[] = [];
    const rackTablesErrors = [];

    for (const sourceLocation of map.sourceLocations) {
        try {
            const racks = await listRackTablesRacksByLocation(sourceLocation.externalLocationId);

            for (const rack of racks) {
                const normalizedRack = normalizeRack(
                    rack,
                    sourceLocation,
                    map.matchingRule,
                    input.includeRawRackTablesData,
                );

                if (isInvalidRack(normalizedRack)) {
                    invalidRacks.push(normalizedRack);
                    continue;
                }

                normalizedRacks.push(normalizedRack);
            }
        } catch (error) {
            if (error instanceof RackTablesClientError) {
                rackTablesErrors.push({
                    externalLocationId: sourceLocation.externalLocationId,
                    externalLocationName: sourceLocation.externalLocationName,
                    message: error.message,
                });

                continue;
            }

            throw error;
        }
    }

    if (rackTablesErrors.length === map.sourceLocations.length && map.sourceLocations.length > 0) {
        throw new RenderingDependencyError('Unable to load racks from RackTables');
    }

    const dynamicRacks = [];
    const unmappedRacks = [];
    const conflicts: RenderingConflict[] = [
        ...invalidRacks.map((rack) => ({
            type: rack.type,
            message: rack.message,
            rack,
        })),
    ];
    const dynamicRacksByPosition = new Map<string, NormalizedRack[]>();

    for (const rack of normalizedRacks) {
        const key = rackSlotKey(rack.rowCode, rack.rackCode);
        const currentRacks = dynamicRacksByPosition.get(key) ?? [];

        currentRacks.push(rack);
        dynamicRacksByPosition.set(key, currentRacks);
    }

    for (const [key, racks] of dynamicRacksByPosition) {
        const rackSlot = rackSlotByPosition.get(key);

        if (!rackSlot) {
            unmappedRacks.push(...racks.map((rack) => ({
                externalRackId: rack.rackTablesId,
                name: rack.rackTablesName,
                row: rack.rowCode,
                rackCode: rack.rackCode,
                reason: 'RACK_SLOT_NOT_FOUND',
                rack,
            })));
            continue;
        }

        if (racks.length > 1) {
            conflicts.push({
                type: 'DYNAMIC_RACK_SLOT_CONFLICT',
                rowCode: rackSlot.normalizedRowCode,
                rackCode: rackSlot.rackCode,
                rackSlotId: rackSlot.id,
                racks,
            });
        }

        dynamicRacks.push(...racks.map((rack) => toRenderableRack(rack, rackSlot)));
    }

    const unusedRackSlots = rackSlots.filter((rackSlot) => (
        !dynamicRacksByPosition.has(normalizedRackSlotKey(rackSlot, map.matchingRule))
    ));
    const renderItems = [
        ...elements.map(toRenderableElement),
        ...dynamicRacks,
    ].sort((left, right) => {
        const leftZIndex = 'zIndex' in left ? left.zIndex : 0;
        const rightZIndex = 'zIndex' in right ? right.zIndex : 0;

        return leftZIndex - rightZIndex;
    });

    return {
        map,
        locations: map.sourceLocations,
        rackSlots,
        elements,
        racks: dynamicRacks,
        renderItems,
        unmappedRacks,
        invalidRacks,
        unusedRackSlots,
        conflicts,
        rackTablesErrors,
    };
}
