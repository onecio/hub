import { z } from 'zod';

export const schemas = {
  userList: z.object({
    page: z.coerce.number().int().positive().default(1),
    size: z.coerce.number().int().min(1).max(100).default(20),
  }),

  userUpdate: z.object({
    name: z.string().min(3).max(255).optional(),
    registration: z.string().min(1).max(50).optional(),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
  }).strict(),

  userDelete: z.object({
    user_id: z.string().uuid('ID de usuário deve ser UUID válido'),
  }),

  roleList: z.object({
    user_id: z.string().uuid('ID de usuário deve ser UUID válido'),
  }),

  roleRemove: z.object({
    user_id: z.string().uuid('ID de usuário deve ser UUID válido'),
    role_id: z.string().uuid('ID de role deve ser UUID válido'),
  }),

  auditLogList: z.object({
    page: z.coerce.number().int().positive().default(1),
    size: z.coerce.number().int().min(1).max(100).default(20),
    actor_id: z.string().uuid().optional(),
    action: z.string().optional(),
    target_type: z.string().optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
  }),
};
