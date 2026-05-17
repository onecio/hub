export function rbacMiddleware(requiredPermissions = []) {
  return async (request, reply) => {
    if (!request.user) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Autenticação necessária',
      });
      return;
    }

    if (requiredPermissions.length === 0) {
      return;
    }

    const userPermissions = new Set(request.user.permissions || []);
    const hasAllPermissions = requiredPermissions.every(
      perm => userPermissions.has(perm)
    );

    if (!hasAllPermissions) {
      reply.status(403).send({
        error: 'Forbidden',
        message: `Permissões necessárias: ${requiredPermissions.join(', ')}`,
      });
    }
  };
}
