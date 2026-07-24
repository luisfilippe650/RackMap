import { z } from 'zod';
import { RackNumberStrategy } from '../../generated/prisma/enums';

const ColorSchema = z.string().min(1).max(20);
const DimensionSchema = z.number().positive();

export const MapIdSchema = z.object({
    id: z.coerce.number().int().positive(),
});


export const CreateMapSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(255).optional().nullable(),
    width: DimensionSchema.optional(),
    height: DimensionSchema.optional(),
    backgroundColor: ColorSchema.optional().nullable(),
    gridEnabled: z.boolean().optional(),
});


export const UpdateMapSchema = CreateMapSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided' },
);


export const ListMapsSchema = z.object({
    search: z.string().trim().min(1).optional(),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(1).max(100).default(50),
});


export const SetMapDimensionsSchema = z.object({
    width: DimensionSchema,
    height: DimensionSchema,
});


export const RackTablesLocationSchema = z.object({
    externalLocationId: z.number().int().positive(),
    externalLocationName: z.string().min(1).max(150),
    normalizedLocationName: z.string().min(1).max(150).optional(),
    active: z.boolean().optional(),
});


export const AssociateRackTablesLocationsSchema = z.object({
    locations: z.array(RackTablesLocationSchema).min(1),
    deactivateMissing: z.boolean().default(false),
});


export const ConfigureNormalizationRulesSchema = z.object({
    rackNumberStrategy: z.enum(RackNumberStrategy).optional(),
    rackNamePattern: z.string().min(1).max(255).optional().nullable(),
    uppercaseRow: z.boolean().optional(),
    trimValues: z.boolean().optional(),
    removeSpacesFromRow: z.boolean().optional(),
    rackCodePadding: z.number().int().positive().optional().nullable(),
});


export type CreateMapDTO = z.infer<typeof CreateMapSchema>;
export type UpdateMapDTO = z.infer<typeof UpdateMapSchema>;
export type ListMapsDTO = z.infer<typeof ListMapsSchema>;
export type SetMapDimensionsDTO = z.infer<typeof SetMapDimensionsSchema>;
export type RackTablesLocationDTO = z.infer<typeof RackTablesLocationSchema>;
export type AssociateRackTablesLocationsDTO = z.infer<typeof AssociateRackTablesLocationsSchema>;
export type ConfigureNormalizationRulesDTO = z.infer<typeof ConfigureNormalizationRulesSchema>;
export type MapDTO = CreateMapDTO;
