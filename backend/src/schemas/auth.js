import { z } from 'zod';

const passwordValidation = z
  .string()
  .min(14, 'Senha deve ter no mínimo 14 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um dígito')
  .regex(/[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]/, 'Senha deve conter pelo menos um caractere especial');

const emailValidation = z.string().email('Email inválido');

export const schemas = {
  login: z.object({
    email: emailValidation,
    password: z.string().min(1, 'Senha é obrigatória'),
  }),

  mfaVerify: z.object({
    code: z.string().regex(/^\d{6}$/, 'Código TOTP deve ter 6 dígitos'),
  }),

  passwordChange: z.object({
    old_password: z.string().min(1, 'Senha atual é obrigatória'),
    new_password: passwordValidation,
  }).refine(
    (data) => data.old_password !== data.new_password,
    { message: 'Nova senha não pode ser igual à senha atual', path: ['new_password'] }
  ),

  userCreate: z.object({
    email: emailValidation,
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(255),
    registration: z.string().min(1, 'Matrícula é obrigatória').max(50),
    password: passwordValidation,
    roles: z.array(z.string().uuid('ID de role deve ser UUID válido')).optional().default([]),
  }),

  roleAssign: z.object({
    role_id: z.string().uuid('ID de role deve ser UUID válido'),
    expires_at: z.string().datetime().optional(),
  }),

  mfaSetup: z.object({
    verification_code: z.string().regex(/^\d{6}$/, 'Código TOTP deve ter 6 dígitos'),
  }),
};
