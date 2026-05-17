import Fastify from 'fastify';
import { config } from './config/index.js';

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
  genReqId: () => crypto.randomUUID(),
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'requestId',
  trustProxy: true,
  // Impede consumo excessivo de memória em bodies grandes
  bodyLimit: 5_242_880, // 5 MB padrão; ferramentas de PDF sobrescrevem para 25 MB
});

// ── Healthcheck (sem autenticação, sem rate limit) ────────────────────────────

app.get('/health', { logLevel: 'warn' }, async (_req, reply) => {
  reply.send({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/ready', { logLevel: 'warn' }, async (_req, reply) => {
  // Fase 2: verificar conectividade com DB antes de retornar ok
  reply.send({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Plugins, middlewares e módulos serão registrados aqui nas próximas fases ──
// Fase 3: auth, RBAC, MFA, rate-limit, CSRF, securityHeaders, auditLogger
// Fase 4: resources, categories, favorites, history
// Fase 5: admin
// Fase 6: monitoring
// Fase 7: tools, shortlinks
// Fase 8: restricted
// Fase 9: incidents, SI hub

// ── Boot ─────────────────────────────────────────────────────────────────────

const start = async () => {
  try {
    await app.listen({ port: config.PORT, host: config.HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
