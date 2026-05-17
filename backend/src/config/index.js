import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),

  DB_PATH: z.string().min(1).default('/app/data/hub.db'),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_PRETTY: z.coerce.boolean().default(false),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET deve ter no mínimo 32 caracteres'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),

  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET deve ter no mínimo 32 caracteres'),
  CSRF_SECRET: z.string().min(32, 'CSRF_SECRET deve ter no mínimo 32 caracteres'),
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY deve ter no mínimo 32 caracteres'),

  CORS_ORIGINS: z.string().default('http://localhost'),

  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_LOGIN_MAX: z.coerce.number().int().positive().default(5),
  RATE_LIMIT_LOGIN_WINDOW_MS: z.coerce.number().int().positive().default(900_000),

  METRICS_TOKEN: z.string().min(16).optional(),
  WEBHOOK_SECRET: z.string().min(16).optional(),

  BACKUP_INTERVAL_HOURS: z.coerce.number().int().positive().default(6),
  BACKUP_RETENTION_DAYS: z.coerce.number().int().positive().default(7),
  BACKUP_PATH: z.string().default('/backups'),

  MONITOR_DEFAULT_INTERVAL: z.coerce.number().int().positive().default(60),
  MONITOR_DEFAULT_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  process.stderr.write('Configuração inválida — variáveis de ambiente ausentes ou incorretas:\n');
  process.stderr.write(JSON.stringify(result.error.format(), null, 2) + '\n');
  process.exit(1);
}

export const config = Object.freeze(result.data);
