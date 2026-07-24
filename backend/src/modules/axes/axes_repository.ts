import { prisma } from "../../core/prisma";
import {
    CreateColumnsDTO,
    CreateRowsDTO,
    ReorderAxisDTO,
    SetAxesDTO,
    SetColumnWidthDTO,
    SetRowHeightDTO,
    UpdateColumnDTO,
    UpdateRowDTO,
} from "./axes_dto";

const SORT_ORDER_OFFSET = 100000;

export function getAxes(mapId: number) {
    return prisma.datacenterMap.findUnique({
        where: { id: mapId },
        select: {
            id: true,
            columns: {
                orderBy: { sortOrder: 'asc' },
            },
            rows: {
                orderBy: { sortOrder: 'asc' },
            },
        },
    });
}

export function listColumns(mapId: number) {
    return prisma.mapColumn.findMany({
        where: { mapId },
        orderBy: { sortOrder: 'asc' },
    });
}

export function listRows(mapId: number) {
    return prisma.mapRow.findMany({
        where: { mapId },
        orderBy: { sortOrder: 'asc' },
    });
}

export function createColumns(mapId: number, input: CreateColumnsDTO) {
    return prisma.$transaction(async (tx) => {
        await tx.datacenterMap.findUniqueOrThrow({ where: { id: mapId } });

        const lastColumn = await tx.mapColumn.findFirst({
            where: { mapId },
            orderBy: { sortOrder: 'desc' },
        });
        const startOrder = (lastColumn?.sortOrder ?? 0) + 1;

        await tx.mapColumn.createMany({
            data: input.columns.map((column, index) => ({
                mapId,
                code: column.code,
                label: column.label,
                width: column.width,
                visible: column.visible,
                sortOrder: startOrder + index,
            })),
        });

        return tx.mapColumn.findMany({
            where: { mapId },
            orderBy: { sortOrder: 'asc' },
        });
    });
}

export function createRows(mapId: number, input: CreateRowsDTO) {
    return prisma.$transaction(async (tx) => {
        await tx.datacenterMap.findUniqueOrThrow({ where: { id: mapId } });

        const lastRow = await tx.mapRow.findFirst({
            where: { mapId },
            orderBy: { sortOrder: 'desc' },
        });
        const startOrder = (lastRow?.sortOrder ?? 0) + 1;

        await tx.mapRow.createMany({
            data: input.rows.map((row, index) => ({
                mapId,
                code: row.code,
                label: row.label,
                height: row.height,
                visible: row.visible,
                sortOrder: startOrder + index,
            })),
        });

        return tx.mapRow.findMany({
            where: { mapId },
            orderBy: { sortOrder: 'asc' },
        });
    });
}

export function reorderColumns(mapId: number, input: ReorderAxisDTO) {

    return prisma.$transaction(async (tx) => {
        
        const columns = await tx.mapColumn.findMany({
            where: { mapId },
            orderBy: { sortOrder: 'asc' },
        });

        const existingCodes = new Set(columns.map((column) => column.code));
        const missingCodes = input.codes.filter((code) => !existingCodes.has(code));

        if (missingCodes.length > 0) {
            throw new Error(`Columns not found: ${missingCodes.join(', ')}`);
        }

        await tx.mapColumn.updateMany({
            where: { mapId },
            data: { sortOrder: { increment: SORT_ORDER_OFFSET } },
        });

        const requestedCodes = new Set(input.codes);
        const orderedCodes = [
            ...input.codes,
            ...columns
                .filter((column) => !requestedCodes.has(column.code))
                .map((column) => column.code),
        ];

        for (const [index, code] of orderedCodes.entries()) {
            await tx.mapColumn.update({
                where: {
                    mapId_code: { mapId, code },
                },
                data: { sortOrder: index + 1 },
            });
        }

        return tx.mapColumn.findMany({
            where: { mapId },
            orderBy: { sortOrder: 'asc' },
        });
    });
}

export function reorderRows(mapId: number, input: ReorderAxisDTO) {
    return prisma.$transaction(async (tx) => {
        const rows = await tx.mapRow.findMany({
            where: { mapId },
            orderBy: { sortOrder: 'asc' },
        });

        const existingCodes = new Set(rows.map((row) => row.code));
        const missingCodes = input.codes.filter((code) => !existingCodes.has(code));

        if (missingCodes.length > 0) {
            throw new Error(`Rows not found: ${missingCodes.join(', ')}`);
        }

        await tx.mapRow.updateMany({
            where: { mapId },
            data: { sortOrder: { increment: SORT_ORDER_OFFSET } },
        });

        const requestedCodes = new Set(input.codes);
        const orderedCodes = [
            ...input.codes,
            ...rows
                .filter((row) => !requestedCodes.has(row.code))
                .map((row) => row.code),
        ];

        for (const [index, code] of orderedCodes.entries()) {
            await tx.mapRow.update({
                where: {
                    mapId_code: { mapId, code },
                },
                data: { sortOrder: index + 1 },
            });
        }

        return tx.mapRow.findMany({
            where: { mapId },
            orderBy: { sortOrder: 'asc' },
        });
    });
}

export function setColumnWidth(mapId: number, columnId: number, input: SetColumnWidthDTO) {
    return prisma.mapColumn.update({
        where: {
            id: columnId,
            mapId,
        },
        data: { width: input.width },
    });
}

export function setRowHeight(mapId: number, rowId: number, input: SetRowHeightDTO) {
    return prisma.mapRow.update({
        where: {
            id: rowId,
            mapId,
        },
        data: { height: input.height },
    });
}

export function updateColumn(columnId: number, input: UpdateColumnDTO) {
    return prisma.mapColumn.update({
        where: { id: columnId },
        data: input,
    });
}

export function updateRow(rowId: number, input: UpdateRowDTO) {
    return prisma.mapRow.update({
        where: { id: rowId },
        data: input,
    });
}

export function deleteColumn(columnId: number) {
    return prisma.mapColumn.delete({
        where: { id: columnId },
    });
}

export function deleteRow(rowId: number) {
    return prisma.mapRow.delete({
        where: { id: rowId },
    });
}

export function setAxes(mapId: number, input: SetAxesDTO) {
    return prisma.$transaction(async (tx) => {
        await tx.datacenterMap.findUniqueOrThrow({ where: { id: mapId } });

        if (input.columns.length > 0) {
            await tx.mapColumn.updateMany({
                where: { mapId },
                data: { sortOrder: { increment: SORT_ORDER_OFFSET } },
            });
        }

        for (const column of input.columns) {
            await tx.mapColumn.upsert({
                where: {
                    mapId_code: {
                        mapId,
                        code: column.code,
                    },
                },
                create: {
                    mapId,
                    code: column.code,
                    label: column.label,
                    sortOrder: column.sortOrder,
                    width: column.width,
                    visible: column.visible,
                },
                update: {
                    label: column.label,
                    sortOrder: column.sortOrder,
                    width: column.width,
                    visible: column.visible,
                },
            });
        }

        if (input.rows.length > 0) {
            await tx.mapRow.updateMany({
                where: { mapId },
                data: { sortOrder: { increment: SORT_ORDER_OFFSET } },
            });
        }

        for (const row of input.rows) {
            await tx.mapRow.upsert({
                where: {
                    mapId_code: {
                        mapId,
                        code: row.code,
                    },
                },
                create: {
                    mapId,
                    code: row.code,
                    label: row.label,
                    sortOrder: row.sortOrder,
                    height: row.height,
                    visible: row.visible,
                },
                update: {
                    label: row.label,
                    sortOrder: row.sortOrder,
                    height: row.height,
                    visible: row.visible,
                },
            });
        }

        return tx.datacenterMap.findUniqueOrThrow({
            where: { id: mapId },
            select: {
                id: true,
                columns: { orderBy: { sortOrder: 'asc' } },
                rows: { orderBy: { sortOrder: 'asc' } },
            },
        });
    });
}
