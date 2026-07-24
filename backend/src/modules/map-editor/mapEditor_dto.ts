import { z } from 'zod';
import { MapElementType } from '../../generated/prisma/enums';

const PositiveDimensionSchema = z.number().positive();
const GridIndexSchema = z.number().int().min(0);
const GridSpanSchema = z.number().int().positive();

export const MapEditorParamsSchema = z.object({
    mapId: z.coerce.number().int().positive(),
});

export const MapEditorElementTypeSchema = z.enum([
    'PDU',
    'WALL',
    'DOOR',
    'CORRIDOR',
    'COLUMN',
    'UPS',
    'AIR_CONDITIONER',
]);

export const SaveMapEditorSchema = z.object({
    map: z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(255).optional().nullable(),
        columnCount: z.number().int().positive(),
        rowCount: z.number().int().positive(),
    }),
    columns: z.array(z.object({
        code: z.string().trim().min(1).max(30),
        order: z.number().int().min(0),
        width: PositiveDimensionSchema,
    })).min(1),
    rows: z.array(z.object({
        code: z.string().trim().min(1).max(30),
        order: z.number().int().min(0),
        height: PositiveDimensionSchema,
    })).min(1),
    rackSlots: z.array(z.object({
        normalizedRowCode: z.string().trim().min(1).max(50).optional().nullable(),
        rackCode: z.string().trim().min(1).max(50).optional().nullable(),
        rackName: z.string().trim().min(1).max(100).optional().nullable(),
        rackTablesRackId: z.string().trim().min(1).max(100).optional().nullable(),
        rackTablesRackName: z.string().trim().min(1).max(150).optional().nullable(),
        rackTablesRackData: z.unknown().optional().nullable(),
        startColumnIndex: GridIndexSchema,
        startRowIndex: GridIndexSchema,
        columnSpan: GridSpanSchema,
        rowSpan: GridSpanSchema,
        rotation: z.number().optional().default(0),
        zIndex: z.number().int().optional().default(10),
        label: z.string().trim().min(1).max(100).optional().nullable(),
        fillColor: z.string().trim().min(1).max(20).optional().nullable(),
        borderColor: z.string().trim().min(1).max(20).optional().nullable(),
        textColor: z.string().trim().min(1).max(20).optional().nullable(),
    })).default([]),
    elements: z.array(z.object({
        type: MapEditorElementTypeSchema,
        startColumnIndex: GridIndexSchema,
        startRowIndex: GridIndexSchema,
        columnSpan: GridSpanSchema,
        rowSpan: GridSpanSchema,
        rotation: z.number().optional().default(0),
        zIndex: z.number().int().optional().default(1),
        label: z.string().trim().min(1).max(150).optional().nullable(),
        fillColor: z.string().trim().min(1).max(20).optional().nullable(),
        borderColor: z.string().trim().min(1).max(20).optional().nullable(),
        textColor: z.string().trim().min(1).max(20).optional().nullable(),
    })).default([]),
}).refine(
    (data) => new Set(data.columns.map((column) => column.code)).size === data.columns.length,
    { message: 'Column codes must be unique' },
).refine(
    (data) => new Set(data.columns.map((column) => column.order)).size === data.columns.length,
    { message: 'Column order values must be unique' },
).refine(
    (data) => new Set(data.rows.map((row) => row.code)).size === data.rows.length,
    { message: 'Row codes must be unique' },
).refine(
    (data) => new Set(data.rows.map((row) => row.order)).size === data.rows.length,
    { message: 'Row order values must be unique' },
).refine(
    (data) => data.columns.length === data.map.columnCount,
    { message: 'columnCount must match columns length', path: ['map', 'columnCount'] },
).refine(
    (data) => data.rows.length === data.map.rowCount,
    { message: 'rowCount must match rows length', path: ['map', 'rowCount'] },
).refine(
    (data) => [...data.rackSlots, ...data.elements].every((item) => (
        item.startColumnIndex + item.columnSpan <= data.columns.length
        && item.startRowIndex + item.rowSpan <= data.rows.length
    )),
    { message: 'All items must fit inside the grid' },
).refine(
    (data) => {
        const keyedSlots = data.rackSlots.filter((slot) => slot.normalizedRowCode && slot.rackCode);

        return new Set(keyedSlots.map((slot) => `${slot.normalizedRowCode}::${slot.rackCode}`)).size === keyedSlots.length;
    },
    { message: 'Rack slot row/rack codes must be unique when provided' },
);

export type SaveMapEditorDTO = z.infer<typeof SaveMapEditorSchema>;
export type PersistableMapElementType = z.infer<typeof MapEditorElementTypeSchema> & keyof typeof MapElementType;
