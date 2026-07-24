import { z } from 'zod';

const CodeSchema = z.string().trim().min(1).max(50);
const DimensionSchema = z.number().positive();
const CoordinateSchema = z.number();
const ColorSchema = z.string().trim().min(1).max(20);

export const RackSlotMapParamsSchema = z.object({
    mapId: z.coerce.number().int().positive(),
});

export const RackSlotParamsSchema = RackSlotMapParamsSchema.extend({
    slotId: z.coerce.number().int().positive(),
});

export const RackSlotIdParamsSchema = z.object({
    rackSlotId: z.coerce.number().int().positive(),
});

export const FindRackSlotByPositionSchema = RackSlotMapParamsSchema.extend({
    rowCode: CodeSchema,
    rackCode: CodeSchema,
});

const RackSlotInputSchema = z.object({
    rowCode: CodeSchema.optional(),
    normalizedRowCode: CodeSchema.optional(),
    rackCode: CodeSchema.optional().nullable(),
    rackName: z.string().trim().min(1).max(100).optional().nullable(),
    rackTablesRackId: z.string().trim().min(1).max(100).optional().nullable(),
    rackTablesRackName: z.string().trim().min(1).max(150).optional().nullable(),
    rackTablesRackData: z.unknown().optional().nullable(),
    externalRowId: z.number().int().positive().optional().nullable(),
    externalRowName: z.string().trim().min(1).max(100).optional().nullable(),
    positionX: CoordinateSchema,
    positionY: CoordinateSchema,
    width: DimensionSchema.optional(),
    height: DimensionSchema.optional(),
    mapColumnId: z.number().int().positive().optional().nullable(),
    mapRowId: z.number().int().positive().optional().nullable(),
    rotation: z.number().optional(),
    zIndex: z.number().int().optional(),
    label: z.string().trim().min(1).max(100).optional().nullable(),
    fillColor: ColorSchema.optional().nullable(),
    borderColor: ColorSchema.optional().nullable(),
    textColor: ColorSchema.optional().nullable(),
    active: z.boolean().optional(),
});

export const CreateRackSlotSchema = RackSlotInputSchema.transform((data) => ({
    ...data,
    rowCode: data.rowCode ?? data.normalizedRowCode,
}));

export const UpdateRackSlotSchema = RackSlotInputSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided' },
).transform((data) => ({
    ...data,
    rowCode: data.rowCode ?? data.normalizedRowCode,
}));

export const SetRackSlotCoordinatesSchema = z.object({
    positionX: CoordinateSchema,
    positionY: CoordinateSchema,
});

export const SetRackSlotSizeSchema = z.object({
    width: DimensionSchema,
    height: DimensionSchema,
});

export const SetRackSlotActiveSchema = z.object({
    active: z.boolean(),
});

export type CreateRackSlotDTO = z.infer<typeof CreateRackSlotSchema>;
export type UpdateRackSlotDTO = z.infer<typeof UpdateRackSlotSchema>;
export type SetRackSlotCoordinatesDTO = z.infer<typeof SetRackSlotCoordinatesSchema>;
export type SetRackSlotSizeDTO = z.infer<typeof SetRackSlotSizeSchema>;
export type SetRackSlotActiveDTO = z.infer<typeof SetRackSlotActiveSchema>;
