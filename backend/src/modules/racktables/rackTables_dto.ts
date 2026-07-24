import { z } from 'zod';

export const RackTablesRackParamsSchema = z.object({
    rackId: z.string().trim().min(1),
});

export const RackTablesObjectParamsSchema = z.object({
    objectId: z.string().trim().min(1),
});

export const ListRackTablesRacksSchema = z.object({
    search: z.string().trim().min(1).optional(),
});
