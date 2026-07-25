import { ensureRackNetworkLinksTable } from '../../core/databaseSchema';
import { prisma } from '../../core/prisma';
import { listElements } from '../elements/elements_repository';
import { findMapForRendering } from '../maps/maps_repository';
import { listActiveRackSlots } from '../rack-slots/rackSlots_repository';
import { RenderMapDTO } from './rendering_dto';

type RackSlot = Awaited<ReturnType<typeof listActiveRackSlots>>[number];

type RackNetworkLinkRow = {
    id: number;
    name: string;
    source_rack_slot_id: number;
    target_rack_slot_id: number;
    color: string | null;
    cable_type: string | null;
    path_json: unknown;
};

function normalizePathPoints(value: unknown) {
    let decoded = value;

    if (typeof value === 'string') {
        try {
            decoded = JSON.parse(value) as unknown;
        } catch {
            decoded = [];
        }
    }

    if (!Array.isArray(decoded)) {
        return [];
    }

    return decoded
        .filter((point): point is { x: number; y: number } => (
            typeof point === 'object'
            && point !== null
            && typeof (point as { x?: unknown }).x === 'number'
            && typeof (point as { y?: unknown }).y === 'number'
        ))
        .map((point) => ({ x: point.x, y: point.y }));
}

export class RenderingNotFoundError extends Error {}
export class RenderingDependencyError extends Error {}

function decimalToNumber(value: unknown) {
    return Number(value);
}

function toRenderableRack(rackSlot: RackSlot) {
    const rackName = rackSlot.label
        ?? rackSlot.rackTablesRackName
        ?? rackSlot.rackName
        ?? [rackSlot.normalizedRowCode, rackSlot.rackCode].filter(Boolean).join('-')
        ?? 'Rack';

    return {
        kind: 'rack',
        id: rackSlot.id,
        externalRackId: rackSlot.rackTablesRackId ?? rackSlot.id,
        rackTablesRackId: rackSlot.rackTablesRackId,
        rackTablesRackName: rackSlot.rackTablesRackName,
        rackTablesRackData: rackSlot.rackTablesRackData,
        name: rackName,
        rackTablesName: rackSlot.rackTablesRackName,
        rowCode: rackSlot.normalizedRowCode,
        rackCode: rackSlot.rackCode,
        status: rackSlot.rackTablesRackId ? 'LINKED' : 'MANUAL',
        slot: rackSlot,
        geometry: {
            x: decimalToNumber(rackSlot.positionX),
            y: decimalToNumber(rackSlot.positionY),
            width: decimalToNumber(rackSlot.width),
            height: decimalToNumber(rackSlot.height),
            rotation: decimalToNumber(rackSlot.rotation),
            zIndex: rackSlot.zIndex,
        },
        positionX: decimalToNumber(rackSlot.positionX),
        positionY: decimalToNumber(rackSlot.positionY),
        width: decimalToNumber(rackSlot.width),
        height: decimalToNumber(rackSlot.height),
        rotation: decimalToNumber(rackSlot.rotation),
        zIndex: rackSlot.zIndex,
        label: rackSlot.label,
        fillColor: rackSlot.fillColor,
        borderColor: rackSlot.borderColor,
        textColor: rackSlot.textColor,
    };
}

function toRenderableElement(element: Awaited<ReturnType<typeof listElements>>[number]) {
    return {
        kind: 'element',
        ...element,
        geometry: {
            x: decimalToNumber(element.positionX),
            y: decimalToNumber(element.positionY),
            width: decimalToNumber(element.width),
            height: decimalToNumber(element.height),
            rotation: decimalToNumber(element.rotation),
            zIndex: element.zIndex,
        },
    };
}

export async function renderMapService(mapId: number, _input: RenderMapDTO) {
    await ensureRackNetworkLinksTable();

    const map = await findMapForRendering(mapId);

    if (!map) {
        throw new RenderingNotFoundError('Map not found');
    }

    const [rackSlots, elements, networkLinks] = await Promise.all([
        listActiveRackSlots(mapId),
        listElements(mapId, { visible: true }),
        prisma.$queryRaw<RackNetworkLinkRow[]>`
            SELECT id, name, source_rack_slot_id, target_rack_slot_id, color, cable_type, path_json
            FROM rack_network_links
            WHERE map_id = ${mapId}
            ORDER BY id ASC
        `,
    ]);
    const racks = rackSlots.map(toRenderableRack);
    const renderedElements = elements.map(toRenderableElement);
    const renderItems = [
        ...renderedElements,
        ...racks,
    ].sort((left, right) => {
        const leftZIndex = 'zIndex' in left ? Number(left.zIndex) : 0;
        const rightZIndex = 'zIndex' in right ? Number(right.zIndex) : 0;

        return leftZIndex - rightZIndex;
    });

    return {
        map: {
            ...map,
            width: decimalToNumber(map.width),
            height: decimalToNumber(map.height),
        },
        locations: map.sourceLocations,
        rackSlots,
        elements: renderedElements,
        racks,
        networkLinks: networkLinks.map((link) => ({
            id: Number(link.id),
            name: link.name,
            sourceRackSlotId: Number(link.source_rack_slot_id),
            targetRackSlotId: Number(link.target_rack_slot_id),
            color: link.color,
            cableType: link.cable_type,
            pathPoints: normalizePathPoints(link.path_json),
        })),
        renderItems,
        unmappedRacks: [],
        warnings: [],
        invalidRacks: [],
        unusedRackSlots: [],
        conflicts: [],
        rackTablesErrors: [],
    };
}
