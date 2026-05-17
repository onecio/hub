import { config } from '../config/index.js';

class RateLimiter {
  constructor() {
    this.ipAttempts = new Map(); // { ip: { count, resetTime, blockUntil } }
    this.userAttempts = new Map(); // { user_id: { count, resetTime } }
    this.loginAttempts = new Map(); // { ip: [{ timestamp, count, blockUntil }] }
  }

  getBlockedTime(attemptCount) {
    // Bloqueio exponencial: 1s, 2s, 4s, 8s, 16s (máximo)
    const seconds = Math.min(Math.pow(2, attemptCount - 1), 16);
    return seconds * 1000;
  }

  checkLoginLimit(ip) {
    const now = Date.now();
    const key = `login:${ip}`;
    let attempt = this.loginAttempts.get(key) || {
      count: 0,
      resetTime: now + config.RATE_LIMIT_LOGIN_WINDOW_MS,
      blockUntil: 0,
    };

    // Resetar se expirou
    if (now > attempt.resetTime) {
      attempt = {
        count: 0,
        resetTime: now + config.RATE_LIMIT_LOGIN_WINDOW_MS,
        blockUntil: 0,
      };
    }

    // Verificar se bloqueado
    if (now < attempt.blockUntil) {
      return {
        allowed: false,
        retryAfter: Math.ceil((attempt.blockUntil - now) / 1000),
        message: `Muitas tentativas de login. Tente novamente em ${Math.ceil((attempt.blockUntil - now) / 1000)}s`,
      };
    }

    // Incrementar tentativa
    attempt.count++;
    this.loginAttempts.set(key, attempt);

    // Bloquear se exceder limite
    if (attempt.count > config.RATE_LIMIT_LOGIN_MAX) {
      const blockedTime = this.getBlockedTime(attempt.count - config.RATE_LIMIT_LOGIN_MAX);
      attempt.blockUntil = now + blockedTime;
      this.loginAttempts.set(key, attempt);

      return {
        allowed: false,
        retryAfter: Math.ceil(blockedTime / 1000),
        message: `Bloqueado por múltiplas tentativas de login. Tente novamente em ${Math.ceil(blockedTime / 1000)}s`,
      };
    }

    return { allowed: true };
  }

  checkGeneralLimit(ip, userId) {
    const now = Date.now();

    // Limite por IP
    const ipKey = `ip:${ip}`;
    let ipAttempt = this.ipAttempts.get(ipKey) || {
      count: 0,
      resetTime: now + config.RATE_LIMIT_WINDOW_MS,
    };

    if (now > ipAttempt.resetTime) {
      ipAttempt = { count: 0, resetTime: now + config.RATE_LIMIT_WINDOW_MS };
    }

    ipAttempt.count++;
    this.ipAttempts.set(ipKey, ipAttempt);

    if (ipAttempt.count > config.RATE_LIMIT_MAX) {
      return {
        allowed: false,
        retryAfter: Math.ceil((ipAttempt.resetTime - now) / 1000),
        limitType: 'ip',
      };
    }

    // Limite por usuário autenticado (maior limite)
    if (userId) {
      const userKey = `user:${userId}`;
      let userAttempt = this.userAttempts.get(userKey) || {
        count: 0,
        resetTime: now + config.RATE_LIMIT_WINDOW_MS,
      };

      if (now > userAttempt.resetTime) {
        userAttempt = { count: 0, resetTime: now + config.RATE_LIMIT_WINDOW_MS };
      }

      userAttempt.count++;
      this.userAttempts.set(userKey, userAttempt);

      // Limite maior para usuários autenticados (200 req/min)
      if (userAttempt.count > 200) {
        return {
          allowed: false,
          retryAfter: Math.ceil((userAttempt.resetTime - now) / 1000),
          limitType: 'user',
        };
      }
    }

    return { allowed: true };
  }

  cleanup() {
    // Limpar entradas expiradas a cada 10 minutos
    const now = Date.now();

    for (const [key, value] of this.ipAttempts.entries()) {
      if (now > value.resetTime) {
        this.ipAttempts.delete(key);
      }
    }

    for (const [key, value] of this.userAttempts.entries()) {
      if (now > value.resetTime) {
        this.userAttempts.delete(key);
      }
    }

    for (const [key, value] of this.loginAttempts.entries()) {
      if (now > value.resetTime) {
        this.loginAttempts.delete(key);
      }
    }
  }
}

const limiter = new RateLimiter();

// Limpeza periódica
setInterval(() => limiter.cleanup(), 10 * 60 * 1000);

export function rateLimitMiddleware(fastify) {
  fastify.addHook('preHandler', async (request, reply) => {
    const ip = request.headers['x-forwarded-for']?.split(',')[0] || request.ip || 'unknown';

    // Rate limit específico para login
    if (request.url === '/api/v1/auth/login' && request.method === 'POST') {
      const loginCheck = limiter.checkLoginLimit(ip);
      if (!loginCheck.allowed) {
        reply.status(429).send({
          error: 'Too Many Requests',
          message: loginCheck.message,
          retryAfter: loginCheck.retryAfter,
        });
        return;
      }
    } else if (request.url.startsWith('/api/')) {
      // Rate limit geral para APIs
      const generalCheck = limiter.checkGeneralLimit(ip, request.user?.id);
      if (!generalCheck.allowed) {
        reply.status(429).send({
          error: 'Too Many Requests',
          message: `Rate limit excedido (${generalCheck.limitType})`,
          retryAfter: generalCheck.retryAfter,
        });
        return;
      }
    }
  });
}
