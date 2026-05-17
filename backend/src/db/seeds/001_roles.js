import { deterministicId } from '../../utils/id.js';

const roles = [
  { name: 'viewer',     description: 'Acesso somente leitura ao catálogo público', level: 10 },
  { name: 'editor',     description: 'Cria e edita recursos no catálogo',           level: 20 },
  { name: 'admin',      description: 'Gerencia usuários e configurações gerais',    level: 30 },
  { name: 'privileged', description: 'Acesso à área restrita com MFA obrigatório',  level: 40 },
  { name: 'superadmin', description: 'Controle total da plataforma',                level: 50 },
];

const permissions = [
  { code: 'resources:read',    description: 'Lê recursos do catálogo' },
  { code: 'resources:write',   description: 'Cria e edita recursos' },
  { code: 'resources:delete',  description: 'Remove recursos (soft delete)' },
  { code: 'users:read',        description: 'Lista e visualiza usuários' },
  { code: 'users:write',       description: 'Cria e edita usuários' },
  { code: 'users:delete',      description: 'Desativa usuários' },
  { code: 'audit:read',        description: 'Visualiza audit log' },
  { code: 'settings:write',    description: 'Altera configurações da plataforma' },
  { code: 'restricted:access', description: 'Acessa área restrita privilegiada' },
  { code: 'monitoring:write',  description: 'Gerencia targets de monitoramento' },
  { code: 'incidents:write',   description: 'Gerencia incidentes de SI' },
  { code: 'shortlinks:write',  description: 'Cria e gerencia encurtador de links' },
];

// Permissões por papel (acumulativas por nível)
const rolePermissions = {
  viewer:     ['resources:read'],
  editor:     ['resources:read', 'resources:write', 'shortlinks:write'],
  admin:      ['resources:read', 'resources:write', 'resources:delete',
               'users:read', 'users:write', 'audit:read',
               'monitoring:write', 'incidents:write', 'shortlinks:write'],
  privileged: ['resources:read', 'restricted:access'],
  superadmin: permissions.map((p) => p.code),
};

export function seed(db) {
  const insertRole = db.prepare(
    'INSERT OR IGNORE INTO roles (id, name, description, level) VALUES (?, ?, ?, ?)',
  );
  const insertPerm = db.prepare(
    'INSERT OR IGNORE INTO permissions (id, code, description) VALUES (?, ?, ?)',
  );
  const insertRolePerm = db.prepare(
    'INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
  );

  const permIdByCode = {};
  for (const perm of permissions) {
    const id = deterministicId(`permission:${perm.code}`);
    permIdByCode[perm.code] = id;
    insertPerm.run(id, perm.code, perm.description);
  }

  for (const role of roles) {
    const id = deterministicId(`role:${role.name}`);
    insertRole.run(id, role.name, role.description, role.level);

    for (const code of rolePermissions[role.name] ?? []) {
      insertRolePerm.run(id, permIdByCode[code]);
    }
  }
}
