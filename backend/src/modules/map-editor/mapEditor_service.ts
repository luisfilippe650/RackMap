import { prisma } from '../../core/prisma';
import { SaveMapEditorDTO } from './mapEditor_dto';

export class MapEditorNotFoundError extends Error {}

function sortedByOrder<T extends { order: number }>(items: T[]) {
    return [...items].sort((left, right) => left.order - right.order);
}

function sumDimensions(items: Array<{ width?: number; height?: number }>, key: 'width' | 'height', start: number, span: number) {
    return items.slice(start, start + span).reduce((total, item) => total + Number(item[key] ?? 0), 0);
}

function startOffset(items: Array<{ width?: number; height?: number }>, key: 'width' | 'height', start: number) {
    return items.slice(0, start).reduce((total, item) => total + Number(item[key] ?? 0), 0);
}

function findStartIndexByOffset(offset: number, sizes: number[]) {
    let current = 0;

    for (const [index, size] of sizes.entries()) {
        if (Math.abs(current - offset) < 0.01 || offset < current + size) {
            return index;
        }

        current += size;
    }

    return Math.max(0, sizes.length - 1);
}

function findSpanBySize(startIndex: number, size: number, sizes: number[]) {
    let total = 0;
    let span = 0;

    for (let index = startIndex; index < sizes.length && total < size - 0.01; index += 1) {
        total += sizes[index];
        span += 1;
    }

    return Math.max(1, span);
}

function gridGeometry(
    item: { startColumnIndex: number; startRowIndex: number; columnSpan: number; rowSpan: number },
    columns: Array<{ width: number }>,
    rows: Array<{ height: number }>,
) {
    return {
        positionX: startOffset(columns, 'width', item.startColumnIndex),
        positionY: startOffset(rows, 'height', item.startRowIndex),
        width: sumDimensions(columns, 'width', item.startColumnIndex, item.columnSpan),
        height: sumDimensions(rows, 'height', item.startRowIndex, item.rowSpan),
    };
}

export async function getMapEditorService(mapId: number) {
    const map = await prisma.datacenterMap.findUnique({
        where: { id: mapId },
        include: {
            columns: { orderBy: { sortOrder: 'asc' } },
            rows: { orderBy: { sortOrder: 'asc' } },
            rackSlots: { orderBy: [{ zIndex: 'asc' }, { id: 'asc' }] },
            elements: { orderBy: [{ zIndex: 'asc' }, { id: 'asc' }] },
        },
    });

    if (!map) {
        throw new MapEditorNotFoundError('Map not found');
    }

    const columnSizes = map.columns.map((column) => Number(column.width));
    const rowSizes = map.rows.map((row) => Number(row.height));

    return {
        map: {
            id: map.id,
            name: map.name,
            description: map.description,
            columnCount: map.columns.length,
            rowCount: map.rows.length,
        },
        columns: map.columns.map((column, index) => ({
            id: String(column.id),
            code: column.code,
            order: index,
            width: Number(column.width),
        })),
        rows: map.rows.map((row, index) => ({
            id: String(row.id),
            code: row.code,
            order: index,
            height: Number(row.height),
        })),
        rackSlots: map.rackSlots.map((slot) => {
            const startColumnIndex = findStartIndexByOffset(Number(slot.positionX), columnSizes);
            const startRowIndex = findStartIndexByOffset(Number(slot.positionY), rowSizes);

            return {
                id: `rack-slot-${slot.id}`,
                persistedId: slot.id,
                type: 'RACK_SLOT',
                startColumnIndex,
                startRowIndex,
                columnSpan: findSpanBySize(startColumnIndex, Number(slot.width), columnSizes),
                rowSpan: findSpanBySize(startRowIndex, Number(slot.height), rowSizes),
                rotation: Number(slot.rotation),
                zIndex: slot.zIndex,
                label: slot.label,
                normalizedRowCode: slot.normalizedRowCode,
                rackCode: slot.rackCode,
                rackName: slot.rackName,
                rackTablesRackId: slot.rackTablesRackId,
                rackTablesRackName: slot.rackTablesRackName,
                rackTablesRackData: slot.rackTablesRackData,
                fillColor: slot.fillColor,
                borderColor: slot.borderColor,
                textColor: slot.textColor,
            };
        }),
        elements: map.elements.map((element) => {
            const startColumnIndex = findStartIndexByOffset(Number(element.positionX), columnSizes);
            const startRowIndex = findStartIndexByOffset(Number(element.positionY), rowSizes);

            return {
                id: `element-${element.id}`,
                persistedId: element.id,
                type: element.type,
                startColumnIndex,
                startRowIndex,
                columnSpan: findSpanBySize(startColumnIndex, Number(element.width), columnSizes),
                rowSpan: findSpanBySize(startRowIndex, Number(element.height), rowSizes),
                rotation: Number(element.rotation),
                zIndex: element.zIndex,
                label: element.label,
                fillColor: element.fillColor,
                borderColor: element.borderColor,
                textColor: element.textColor,
            };
        }),
    };
}

export async function saveMapEditorService(mapId: number, input: SaveMapEditorDTO) {
    const columns = sortedByOrder(input.columns);
    const rows = sortedByOrder(input.rows);
    const width = columns.reduce((total, column) => total + column.width, 0);
    const height = rows.reduce((total, row) => total + row.height, 0);

    await prisma.$transaction(async (tx) => {
        await tx.datacenterMap.findUniqueOrThrow({ where: { id: mapId } });
        await tx.rackSlot.deleteMany({ where: { mapId } });
        await tx.mapElement.deleteMany({ where: { mapId } });
        await tx.mapColumn.deleteMany({ where: { mapId } });
        await tx.mapRow.deleteMany({ where: { mapId } });

        await tx.datacenterMap.update({
            where: { id: mapId },
            data: {
                name: input.map.name,
                description: input.map.description ?? null,
                width,
                height,
                gridEnabled: true,
            },
        });

        const createdColumns = [];
        const createdRows = [];

        for (const [index, column] of columns.entries()) {
            createdColumns.push(await tx.mapColumn.create({
                data: {
                    mapId,
                    code: column.code,
                    label: column.code,
                    sortOrder: index + 1,
                    width: column.width,
                    visible: true,
                },
            }));
        }

        for (const [index, row] of rows.entries()) {
            createdRows.push(await tx.mapRow.create({
                data: {
                    mapId,
                    code: row.code,
                    label: row.code,
                    sortOrder: index + 1,
                    height: row.height,
                    visible: true,
                },
            }));
        }

        for (const slot of input.rackSlots) {
            const geometry = gridGeometry(slot, columns, rows);

            await tx.rackSlot.create({
                data: {
                    mapId,
                    normalizedRowCode: slot.normalizedRowCode,
                    rackCode: slot.rackCode,
                    mapColumnId: createdColumns[slot.startColumnIndex]?.id,
                    mapRowId: createdRows[slot.startRowIndex]?.id,
                    ...geometry,
                    rotation: slot.rotation,
                    zIndex: slot.zIndex,
                    label: slot.label
                        ?? slot.rackName
                        ?? slot.rackTablesRackName
                        ?? ([slot.normalizedRowCode, slot.rackCode].filter(Boolean).join('-') || null),
                    rackName: slot.rackName,
                    rackTablesRackId: slot.rackTablesRackId,
                    rackTablesRackName: slot.rackTablesRackName,
                    rackTablesRackData: slot.rackTablesRackData,
                    fillColor: slot.fillColor,
                    borderColor: slot.borderColor,
                    textColor: slot.textColor,
                    active: true,
                },
            });
        }

        for (const element of input.elements) {
            const geometry = gridGeometry(element, columns, rows);

            await tx.mapElement.create({
                data: {
                    mapId,
                    type: element.type,
                    label: element.label,
                    ...geometry,
                    rotation: element.rotation,
                    zIndex: element.zIndex,
                    fillColor: element.fillColor,
                    borderColor: element.borderColor,
                    textColor: element.textColor,
                    visible: true,
                },
            });
        }
    });

    return getMapEditorService(mapId);
}
