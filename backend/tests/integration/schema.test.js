import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '../helpers/testDb.js';

const EXPECTED_TABLES = [
  'users', 'roles', 'permissions', 'role_permissions', 'user_roles', 'sessions',
  'categories', 'resources',
  'favorites', 'access_history', 'user_preferences',
  'monitoring_targets', 'monitoring_checks', 'monitoring_incidents',
  'short_links', 'short_link_clicks', 'tool_usage',
  'incidents', 'audit_log', 'settings',
];

describe('Schema', () => {
  let db;
  beforeEach(() => { db = createTestDb(); });

  it('cria todas as tabelas esperadas', () => {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_migrations' ORDER BY name")
      .all()
      .map((r) => r.name);

    for (const t of EXPECTED_TABLES) {
      expect(tables, `tabela ausente: ${t}`).toContain(t);
    }
  });

  it('tabela users tem colunas obrigatórias', () => {
    const cols = db.prepare('PRAGMA table_info(users)').all().map((c) => c.name);
    for (const col of ['id', 'email', 'name', 'password_hash', 'mfa_enabled', 'status', 'created_at', 'updated_at', 'deleted_at']) {
      expect(cols).toContain(col);
    }
  });

  it('tabela resources tem colunas obrigatórias', () => {
    const cols = db.prepare('PRAGMA table_info(resources)').all().map((c) => c.name);
    for (const col of ['id', 'name', 'slug', 'url', 'category_id', 'status', 'is_external', 'visibility', 'deleted_at']) {
      expect(cols).toContain(col);
    }
  });

  it('tabela audit_log tem hash chain columns', () => {
    const cols = db.prepare('PRAGMA table_info(audit_log)').all().map((c) => c.name);
    for (const col of ['sequence', 'previous_hash', 'current_hash', 'actor_id', 'action']) {
      expect(cols).toContain(col);
    }
  });

  it('foreign key rejeita resource com category_id inexistente', () => {
    expect(() => {
      db.prepare(
        "INSERT INTO resources (id, name, slug, url, category_id) VALUES ('r1','Test','test','https://x.com','nonexistent-id')",
      ).run();
    }).toThrow();
  });

  it('rejeita status inválido em users', () => {
    expect(() => {
      db.prepare(
        "INSERT INTO users (id, email, name, status) VALUES ('u1','a@b.com','A','superuser')",
      ).run();
    }).toThrow();
  });
});
