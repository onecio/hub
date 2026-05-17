import { createHmac } from 'crypto';
import { config } from '../config/index.js';
import { getDb } from '../db/connection.js';

function verifyJWT(token, secret) {
  const [headerB64, payloadB64, signatureB64] = token.split('.');

  if (!headerB64 || !payloadB64 || !signatureB64) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());

    // Verificar expiração
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    // Verificar signature (HMAC-SHA256)
    const message = `${headerB64}.${payloadB64}`;
    const expectedSignature = createHmac('sha256', secret)
      .update(message)
      .digest('base64url');

    if (signatureB64 !== expectedSignature) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function authMiddleware(fastify) {
  fastify.addHook('preHandler', async (request, reply) => {
    // Extrair token de Authorization header ou cookie de sessão
    const authHeader = request.headers.authorization;
    let token = null;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (request.cookies.__Host_session) {
      token = request.cookies.__Host_session;
    }

    if (!token) {
      request.user = null;
      return;
    }

    // Verificar JWT
    const payload = verifyJWT(token, config.JWT_SECRET);
    if (!payload) {
      request.user = null;
      return;
    }

    try {
      // Verificar se a sessão não foi revogada (refresh token)
      // Para access token JWT curto, não verificamos revogação
      // Apenas para refresh tokens armazenamos em sessions table

      // Carregar usuário do banco para pegar roles e permissions
      const user = getDb().prepare(`
        SELECT u.id, u.email, u.name, u.registration, u.mfa_enabled, u.status
        FROM users u
        WHERE u.id = ? AND u.status = 'active'
      `).get(payload.sub);

      if (!user) {
        request.user = null;
        return;
      }

      // Carregar roles do usuário
      const roles = db.prepare(`
        SELECT r.id, r.name, r.level
        FROM roles r
        INNER JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = ? AND (ur.expires_at IS NULL OR ur.expires_at > datetime('now'))
      `).all(user.id);

      // Carregar permissions agregadas a partir dos roles
      const permissions = db.prepare(`
        SELECT DISTINCT p.code
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        INNER JOIN roles r ON r.id = rp.role_id
        INNER JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = ? AND (ur.expires_at IS NULL OR ur.expires_at > datetime('now'))
      `).all(user.id);

      request.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        registration: user.registration,
        mfa_enabled: user.mfa_enabled,
        roles: roles.map(r => ({ id: r.id, name: r.name, level: r.level })),
        permissions: permissions.map(p => p.code),
      };
    } catch (error) {
      fastify.log.error({ error }, 'Erro ao carregar usuário autenticado');
      request.user = null;
    }
  });
}

export function requireAuth(fastify) {
  return async (request, reply) => {
    if (!request.user) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Autenticação necessária',
      });
    }
  };
}

export function requireMFA(fastify) {
  return async (request, reply) => {
    if (!request.user?.mfa_enabled) {
      reply.status(403).send({
        error: 'Forbidden',
        message: 'MFA é obrigatório para este endpoint',
      });
    }
  };
}
