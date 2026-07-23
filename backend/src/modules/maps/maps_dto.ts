import { z } from 'zod';

export const MapSchema = z.object({
    name: z.string().min(1).max(100),
    description : z.string().max(255),
    columnsCount: z.number().int().min(1),
    rowsCount: z.number().int().min(1),
});

export type MapDTO = z.infer<typeof MapSchema>;