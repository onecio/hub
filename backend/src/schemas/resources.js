import { z } from 'zod';

export const schemas = {
  categoryList: z.object({}).strict(),

  resourceList: z.object({
    category: z.string().optional(),
    search: z.string().optional(),
    limit: z.coerce.number().int().positive().max(100).default(20),
    offset: z.coerce.number().int().nonnegative().default(0),
  }).strict(),

  favoriteCreate: z.object({
    resource_id: z.string().uuid(),
  }).strict(),
};
