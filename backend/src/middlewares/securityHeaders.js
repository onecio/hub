import { randomUUID } from 'crypto';

export function securityHeadersMiddleware(fastify) {
  fastify.addHook('onRequest', async (request) => {
    const nonce = randomUUID().replace(/-/g, '');
    request.nonce = nonce;
  });

  fastify.addHook('onSend', async (request, reply) => {
    const nonce = request.nonce;

    // CSP com nonce dinâmico para scripts e styles
    reply.header('Content-Security-Policy',
      `default-src 'self'; ` +
      `script-src 'self' 'nonce-${nonce}'; ` +
      `style-src 'self' 'nonce-${nonce}'; ` +
      `img-src 'self' data: blob:; ` +
      `font-src 'self'; ` +
      `connect-src 'self'; ` +
      `frame-ancestors 'none'; ` +
      `base-uri 'self'; ` +
      `form-action 'self'; ` +
      `object-src 'none'; ` +
      `upgrade-insecure-requests`
    );

    // Headers de segurança obrigatórios
    reply.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header('Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );
    reply.header('Cross-Origin-Opener-Policy', 'same-origin');
    reply.header('Cross-Origin-Resource-Policy', 'same-origin');
    reply.header('Cross-Origin-Embedder-Policy', 'require-corp');

    // Headers de cache para evitar armazenamento de dados sensíveis
    if (request.url.startsWith('/api/')) {
      reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      reply.header('Pragma', 'no-cache');
      reply.header('Expires', '0');
    }
  });
}
