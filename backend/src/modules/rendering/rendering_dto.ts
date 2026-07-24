import { z } from 'zod';

export const RenderingParamsSchema = z.object({
    mapId: z.coerce.number().int().positive(),
});

export const RenderMapSchema = z.object({
    includeRawRackTablesData: z.boolean().optional().default(false),
});

export type RenderMapDTO = z.infer<typeof RenderMapSchema>;
