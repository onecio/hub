import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import csrfProtection from '@fastify/csrf-protection';
import { config } from './config/index.js';
import { getDb } from './db/connection.js';
import { runMigrations } from './db/migrate.js';
import { securityHeadersMiddleware } from './middlewares/securityHeaders.js';
import { authMiddleware } from './middlewares/auth.js';
import { auditLoggerMiddleware } from './middlewares/auditLogger.js';
import { rateLimitMiddleware } from './middlewares/rateLimit.js';
import { registerAuthRoutes } from './modules/auth/index.js';
import { registerUserRoutes } from './modules/users/index.js';
import { registerAuditRoutes } from './modules/audit/index.js';
import { registerResourceRoutes } from './modules/resources/index.js';
import { randomUUID } from 'crypto';

const app = Fastify({
  logger: {
    level: config.LOG_LEVEL,
    ...(config.LOG_PRETTY && {
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      },
    }),
  },
  // UUID v4 por request para correlação em logs/audit
  genReqId: () => randomUUID(),
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'requestId',
  trustProxy: true,
  // Impede consumo excessivo de memória em bodies grandes
  bodyLimit: 5_242_880, // 5 MB padrão; ferramentas de PDF sobrescrevem para 25 MB
});

// ── Plugins Fastify ──────────────────────────────────────────────────────────

await app.register(helmet, { contentSecurityPolicy: false });
await app.register(cors, {
  origin: config.CORS_ORIGINS.split(',').map(o => o.trim()),
});
await app.register(rateLimit, {
  max: config.RATE_LIMIT_MAX,
  timeWindow: `${config.RATE_LIMIT_WINDOW_MS}ms`,
  skip: (request) => request.url.startsWith('/health'),
});
await app.register(cookie);
await app.register(csrfProtection, {
  cookieKey: '__Host-csrf',
});

// ── Middlewares Customizados ─────────────────────────────────────────────────

securityHeadersMiddleware(app);
authMiddleware(app);
auditLoggerMiddleware(app);
rateLimitMiddleware(app);

// ── Healthcheck (sem autenticação, sem rate limit) ────────────────────────────

app.get('/health', { logLevel: 'warn' }, async (_req, reply) => {
  reply.send({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/ready', { logLevel: 'warn' }, async (_req, reply) => {
  const db = getDb();
  const row = db.prepare('SELECT 1 AS ok').get();
  if (row?.ok !== 1) {
    return reply.status(503).send({ status: 'error', message: 'database unavailable' });
  }
  reply.send({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Módulos (Fase 3 + Fase 4) ────────────────────────────────────────────────

await app.register(registerAuthRoutes, { prefix: '/api/v1/auth' });
await app.register(registerUserRoutes, { prefix: '/api/v1/users' });
await app.register(registerAuditRoutes, { prefix: '/api/v1/audit' });
await app.register(registerResourceRoutes, { prefix: '/api/v1' });

// ── Módulos de Fases Futuras ────────────────────────────────────────────────
// Fase 5: admin, history
// Fase 5: admin
// Fase 6: monitoring
// Fase 7: tools, shortlinks
// Fase 8: restricted
// Fase 9: incidents, SI hub

// ── Boot ─────────────────────────────────────────────────────────────────────

const start = async () => {
  try {
    runMigrations(getDb());
    await app.listen({ port: config.PORT, host: config.HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
