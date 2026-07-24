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

export const ColumnIdParamsSchema = z.object({
    columnId: z.coerce.number().int().positive(),
});

export const RowIdParamsSchema = z.object({
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

export const UpdateColumnSchema = z.object({
    code: AxisCodeSchema.optional(),
    label: AxisLabelSchema.optional().nullable(),
    sortOrder: z.number().int().positive().optional(),
    width: DimensionSchema.optional(),
    visible: z.boolean().optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided' },
);

export const UpdateRowSchema = z.object({
    code: AxisCodeSchema.optional(),
    label: AxisLabelSchema.optional().nullable(),
    sortOrder: z.number().int().positive().optional(),
    height: DimensionSchema.optional(),
    visible: z.boolean().optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided' },
);

export const SetAxesSchema = z.object({
    columns: z.array(z.object({
        code: AxisCodeSchema,
        label: AxisLabelSchema.optional().nullable(),
        sortOrder: z.number().int().positive(),
        width: DimensionSchema.optional(),
        visible: z.boolean().optional(),
    })).optional().default([]),
    rows: z.array(z.object({
        code: AxisCodeSchema,
        label: AxisLabelSchema.optional().nullable(),
        sortOrder: z.number().int().positive(),
        height: DimensionSchema.optional(),
        visible: z.boolean().optional(),
    })).optional().default([]),
}).refine(
    (data) => new Set(data.columns.map((column) => column.code)).size === data.columns.length,
    { message: 'Column codes must be unique' },
).refine(
    (data) => new Set(data.columns.map((column) => column.sortOrder)).size === data.columns.length,
    { message: 'Column sortOrder values must be unique' },
).refine(
    (data) => new Set(data.rows.map((row) => row.code)).size === data.rows.length,
    { message: 'Row codes must be unique' },
).refine(
    (data) => new Set(data.rows.map((row) => row.sortOrder)).size === data.rows.length,
    { message: 'Row sortOrder values must be unique' },
);

export type CreateColumnsDTO = z.infer<typeof CreateColumnsSchema>;
export type CreateRowsDTO = z.infer<typeof CreateRowsSchema>;
export type ReorderAxisDTO = z.infer<typeof ReorderAxisSchema>;
export type SetColumnWidthDTO = z.infer<typeof SetColumnWidthSchema>;
export type SetRowHeightDTO = z.infer<typeof SetRowHeightSchema>;
export type UpdateColumnDTO = z.infer<typeof UpdateColumnSchema>;
export type UpdateRowDTO = z.infer<typeof UpdateRowSchema>;
export type SetAxesDTO = z.infer<typeof SetAxesSchema>;
