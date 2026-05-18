import { randomUUID } from 'crypto';
import { getDb } from '../../db/connection.js';
import * as resourceSchemas from '../../schemas/resources.js';

function requireAuth(request, reply) {
  if (!request.user) {
    reply.status(401).send({
      error: 'Unauthorized',
      message: 'Autenticação necessária',
    });
  }
}

export async function registerResourceRoutes(fastify) {
  // GET /api/v1/categories (público)
  fastify.get('/categories', async (request, reply) => {
    try {
      const validation = resourceSchemas.schemas.categoryList.safeParse(request.query);
      if (!validation.success) {
        return reply.status(400).send({
          error: 'Validation Error',
          details: validation.error.flatten(),
        });
      }

      const categories = getDb().prepare(`
        SELECT id, name, icon, color, order_index
        FROM categories
        WHERE active = 1
        ORDER BY order_index ASC
      `).all();

      reply.status(200).send({
        status: 'OK',
        categories,
      });
    } catch (error) {
      fastify.log.error({ error }, 'Erro ao listar categorias');
      reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Erro ao listar categorias',
      });
    }
  });

  // GET /api/v1/resources (público, mas filtra por visibility)
  fastify.get('/resources', async (request, reply) => {
    try {
      const validation = resourceSchemas.schemas.resourceList.safeParse(request.query);
      if (!validation.success) {
        return reply.status(400).send({
          error: 'Validation Error',
          details: validation.error.flatten(),
        });
      }

      const { category, search, limit, offset } = validation.data;
      const userId = request.user?.id;

      let query = `
        SELECT r.id, r.name, r.slug, r.description, r.url, r.icon_svg,
               r.category_id, r.is_new, r.is_external, r.requires_auth, r.visibility
        FROM resources r
        WHERE r.deleted_at IS NULL
      `;

      const params = [];

      if (category) {
        query += ` AND r.category_id = ?`;
        params.push(category);
      }

      if (search) {
        query += ` AND (r.name LIKE ? OR r.description LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      // Filtrar por visibility
      if (userId && request.user?.permissions?.includes('admin:read')) {
        // Admin vê tudo
      } else if (userId && request.user?.permissions?.includes('privileged:read')) {
        // Privileged vê all + authenticated + privileged
        query += ` AND (r.visibility = 'all' OR r.visibility = 'authenticated' OR r.visibility = 'privileged')`;
      } else if (userId) {
        // User autenticado vê all + authenticated
        query += ` AND (r.visibility = 'all' OR r.visibility = 'authenticated')`;
      } else {
        // Público vê apenas all
        query += ` AND r.visibility = 'all'`;
      }

      const resources = getDb().prepare(query).all(...params);

      // Adicionar is_favorited para cada recurso
      if (userId) {
        const favorites = getDb().prepare(`
          SELECT resource_id FROM favorites WHERE user_id = ?
        `).all(userId).map(f => f.resource_id);

        const favoriteSet = new Set(favorites);
        resources.forEach(r => {
          r.is_favorited = favoriteSet.has(r.id);
        });
      } else {
        resources.forEach(r => {
          r.is_favorited = false;
        });
      }

      reply.status(200).send({
        status: 'OK',
        resources: resources.slice(offset, offset + limit),
        total: resources.length,
        limit,
        offset,
      });
    } catch (error) {
      fastify.log.error({ error }, 'Erro ao listar recursos');
      reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Erro ao listar recursos',
      });
    }
  });

  // GET /api/v1/resources/:id (público)
  fastify.get('/resources/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      const resource = getDb().prepare(`
        SELECT r.id, r.name, r.slug, r.description, r.url, r.icon_svg,
               r.category_id, r.is_new, r.is_external, r.requires_auth, r.visibility
        FROM resources r
        WHERE r.id = ? AND r.deleted_at IS NULL
      `).get(id);

      if (!resource) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Recurso não encontrado',
        });
      }

      // Verificar acesso por visibility
      const userId = request.user?.id;
      const userIsAdmin = userId && request.user?.permissions?.includes('admin:read');
      const userIsPrivileged = userId && request.user?.permissions?.includes('privileged:read');

      if (!userIsAdmin) {
        if (resource.visibility === 'privileged' && !userIsPrivileged && userId) {
          return reply.status(403).send({
            error: 'Forbidden',
            message: 'Acesso negado a este recurso',
          });
        }
        if (resource.visibility === 'authenticated' && !userId) {
          return reply.status(403).send({
            error: 'Forbidden',
            message: 'Autenticação necessária para este recurso',
          });
        }
        if (resource.visibility === 'admin') {
          return reply.status(403).send({
            error: 'Forbidden',
            message: 'Acesso negado a este recurso',
          });
        }
      }

      // Adicionar is_favorited
      if (userId) {
        const fav = getDb().prepare(`
          SELECT id FROM favorites WHERE user_id = ? AND resource_id = ?
        `).get(userId, id);
        resource.is_favorited = !!fav;
      } else {
        resource.is_favorited = false;
      }

      reply.status(200).send({
        status: 'OK',
        resource,
      });
    } catch (error) {
      fastify.log.error({ error }, 'Erro ao buscar recurso');
      reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Erro ao buscar recurso',
      });
    }
  });

  // POST /api/v1/favorites (autenticado)
  fastify.post('/favorites', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const validation = resourceSchemas.schemas.favoriteCreate.safeParse(request.body);
      if (!validation.success) {
        return reply.status(400).send({
          error: 'Validation Error',
          details: validation.error.flatten(),
        });
      }

      const { resource_id } = validation.data;
      const user_id = request.user.id;

      // Verificar se recurso existe
      const resource = getDb().prepare(`
        SELECT id FROM resources WHERE id = ? AND deleted_at IS NULL
      `).get(resource_id);

      if (!resource) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Recurso não encontrado',
        });
      }

      // Inserir favorito
      const favId = randomUUID();
      try {
        getDb().prepare(`
          INSERT INTO favorites (id, user_id, resource_id)
          VALUES (?, ?, ?)
        `).run(favId, user_id, resource_id);
      } catch (dbError) {
        if (dbError.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return reply.status(409).send({
            error: 'Conflict',
            message: 'Já adicionado aos favoritos',
          });
        }
        throw dbError;
      }

      reply.status(201).send({
        status: 'Created',
        id: favId,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      fastify.log.error({ error }, 'Erro ao adicionar favorito');
      reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Erro ao adicionar favorito',
      });
    }
  });

  // DELETE /api/v1/favorites/:resource_id (autenticado)
  fastify.delete('/favorites/:resource_id', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const { resource_id } = request.params;
      const user_id = request.user.id;

      const result = getDb().prepare(`
        DELETE FROM favorites
        WHERE user_id = ? AND resource_id = ?
      `).run(user_id, resource_id);

      if (result.changes === 0) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Favorito não encontrado',
        });
      }

      reply.status(200).send({
        status: 'OK',
        message: 'Removido dos favoritos',
      });
    } catch (error) {
      fastify.log.error({ error }, 'Erro ao remover favorito');
      reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Erro ao remover favorito',
      });
    }
  });

  // GET /api/v1/users/me/favorites (autenticado)
  fastify.get('/users/me/favorites', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const user_id = request.user.id;

      const favorites = getDb().prepare(`
        SELECT r.id, r.name, r.slug, r.url, r.category_id
        FROM resources r
        INNER JOIN favorites f ON r.id = f.resource_id
        WHERE f.user_id = ? AND r.deleted_at IS NULL
        ORDER BY f.created_at DESC
      `).all(user_id);

      reply.status(200).send({
        status: 'OK',
        favorites,
      });
    } catch (error) {
      fastify.log.error({ error }, 'Erro ao listar favoritos');
      reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Erro ao listar favoritos',
      });
    }
  });
}
