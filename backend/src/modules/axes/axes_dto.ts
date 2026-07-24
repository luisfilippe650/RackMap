import { z } from 'zod';

const AxisCodeSchema = z.string().trim().min(1).max(30);

const AxisLabelSchema = z.string().trim().min(1).max(100);

const DimensionSchema = z.number().positive();

export const MapAxisParamsSchema = z.object({
    mapId: z.coerce.number().int().positive(),
});

export const ColumnParamsSchema = MapAxisParamsSchema.extend({
    columnId: z.coerce.number().int().positive(),
});

export const RowParamsSchema = MapAxisParamsSchema.extend({
    rowId: z.coerce.number().int().positive(),
});

export const CreateColumnSchema = z.union([
    AxisCodeSchema,
    z.object({
        code: AxisCodeSchema,
        label: AxisLabelSchema.optional().nullable(),
        width: DimensionSchema.optional(),
        visible: z.boolean().optional(),
    }),
]).transform((column) => typeof column === 'string' ? { code: column } : column);

export const CreateColumnsSchema = z.object({
    columns: z.array(CreateColumnSchema).min(1),
}).refine(
    (data) => new Set(data.columns.map((column) => column.code)).size === data.columns.length,
    { message: 'Column codes must be unique' },
);

export const CreateRowSchema = z.union([
    AxisCodeSchema,
    z.object({
        code: AxisCodeSchema,
        label: AxisLabelSchema.optional().nullable(),
        height: DimensionSchema.optional(),
        visible: z.boolean().optional(),
    }),
]).transform((row) => typeof row === 'string' ? { code: row } : row);

export const CreateRowsSchema = z.object({
    rows: z.array(CreateRowSchema).min(1),
}).refine(
    (data) => new Set(data.rows.map((row) => row.code)).size === data.rows.length,
    { message: 'Row codes must be unique' },
);

export const ReorderAxisSchema = z.object({
    codes: z.array(AxisCodeSchema).min(1),
}).refine(
    (data) => new Set(data.codes).size === data.codes.length,
    { message: 'Axis codes must be unique' },
);

export const SetColumnWidthSchema = z.object({
    width: DimensionSchema,
});

export const SetRowHeightSchema = z.object({
    height: DimensionSchema,
});

export type CreateColumnsDTO = z.infer<typeof CreateColumnsSchema>;
export type CreateRowsDTO = z.infer<typeof CreateRowsSchema>;
export type ReorderAxisDTO = z.infer<typeof ReorderAxisSchema>;
export type SetColumnWidthDTO = z.infer<typeof SetColumnWidthSchema>;
export type SetRowHeightDTO = z.infer<typeof SetRowHeightSchema>;
