import { z } from 'zod';
import { MapElementType } from '../../generated/prisma/enums';

const DimensionSchema = z.number().positive();
const CoordinateSchema = z.number();
const ColorSchema = z.string().trim().min(1).max(20);
const LabelSchema = z.string().trim().min(1).max(150);
const GroupKeySchema = z.string().trim().min(1).max(100);
const QueryBooleanSchema = z.preprocess((value) => {
    if (value === 'true') {
        return true;
    }

    if (value === 'false') {
        return false;
    }

    return value;
}, z.boolean());

export const ElementMapParamsSchema = z.object({
    mapId: z.coerce.number().int().positive(),
});

export const ElementParamsSchema = ElementMapParamsSchema.extend({
    elementId: z.coerce.number().int().positive(),
});

export const ElementIdParamsSchema = z.object({
    elementId: z.coerce.number().int().positive(),
});

export const ListElementsSchema = z.object({
    type: z.enum(MapElementType).optional(),
    groupKey: GroupKeySchema.optional(),
    visible: QueryBooleanSchema.optional(),
});

export const CreateElementSchema = z.object({
    type: z.enum(MapElementType),
    label: LabelSchema.optional().nullable(),
    customType: z.string().trim().min(1).max(100).optional().nullable(),
    positionX: CoordinateSchema,
    positionY: CoordinateSchema,
    width: DimensionSchema,
    height: DimensionSchema,
    rotation: z.number().optional(),
    zIndex: z.number().int().optional(),
    groupKey: GroupKeySchema.optional().nullable(),
    fillColor: ColorSchema.optional().nullable(),
    borderColor: ColorSchema.optional().nullable(),
    textColor: ColorSchema.optional().nullable(),
    visible: z.boolean().optional(),
}).refine(
    (data) => data.type === 'CUSTOM' || !data.customType,
    { message: 'customType is only allowed when type is CUSTOM', path: ['customType'] },
);

export const UpdateElementSchema = CreateElementSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided' },
);

export const SetElementPositionSchema = z.object({
    positionX: CoordinateSchema,
    positionY: CoordinateSchema,
});

export const SetElementSizeSchema = z.object({
    width: DimensionSchema,
    height: DimensionSchema,
});

export const SetElementRotationSchema = z.object({
    rotation: z.number(),
});

export const SetElementAppearanceSchema = z.object({
    fillColor: ColorSchema.optional().nullable(),
    borderColor: ColorSchema.optional().nullable(),
    textColor: ColorSchema.optional().nullable(),
    visible: z.boolean().optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one appearance field must be provided' },
);

export const GroupWallElementsSchema = z.object({
    groupKey: GroupKeySchema,
    elementIds: z.array(z.number().int().positive()).min(1),
}).refine(
    (data) => new Set(data.elementIds).size === data.elementIds.length,
    { message: 'Element ids must be unique' },
);

export type ListElementsDTO = z.infer<typeof ListElementsSchema>;
export type CreateElementDTO = z.infer<typeof CreateElementSchema>;
export type UpdateElementDTO = z.infer<typeof UpdateElementSchema>;
export type SetElementPositionDTO = z.infer<typeof SetElementPositionSchema>;
export type SetElementSizeDTO = z.infer<typeof SetElementSizeSchema>;
export type SetElementRotationDTO = z.infer<typeof SetElementRotationSchema>;
export type SetElementAppearanceDTO = z.infer<typeof SetElementAppearanceSchema>;
export type GroupWallElementsDTO = z.infer<typeof GroupWallElementsSchema>;
