import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '../helpers/testDb.js';
import { runSeeds } from '../../src/db/seeds/index.js';
import { deterministicId } from '../../src/utils/id.js';

describe('Seeds', () => {
  let db;
  beforeEach(() => {
    db = createTestDb();
    runSeeds(db);
  });

  it('cria os 5 papéis RBAC', () => {
    const rows = db.prepare('SELECT name FROM roles ORDER BY level').all().map((r) => r.name);
    expect(rows).toEqual(['viewer', 'editor', 'admin', 'privileged', 'superadmin']);
  });

  it('superadmin recebe todas as permissões', () => {
    const totalPerms = db.prepare('SELECT COUNT(*) AS n FROM permissions').get().n;
    const superadminId = deterministicId('role:superadmin');
    const superadminPerms = db.prepare('SELECT COUNT(*) AS n FROM role_permissions WHERE role_id = ?').get(superadminId).n;
    expect(superadminPerms).toBe(totalPerms);
  });

  it('cria 6 categorias', () => {
    const count = db.prepare('SELECT COUNT(*) AS n FROM categories').get().n;
    expect(count).toBe(6);
  });

  it('categorias têm slugs únicos', () => {
    const slugs = db.prepare('SELECT slug FROM categories').all().map((r) => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('cria recursos em todas as categorias', () => {
    const count = db.prepare('SELECT COUNT(*) AS n FROM resources').get().n;
    expect(count).toBeGreaterThan(20);
  });

  it('recursos têm IDs determinísticos e estáveis', () => {
    const seiId = db.prepare("SELECT id FROM resources WHERE slug='sei'").get()?.id;
    expect(seiId).toBe(deterministicId('resource:sei'));
  });

  it('é idempotente — segunda execução de seeds não duplica dados', () => {
    runSeeds(db);
    const cats = db.prepare('SELECT COUNT(*) AS n FROM categories').get().n;
    const roles = db.prepare('SELECT COUNT(*) AS n FROM roles').get().n;
    expect(cats).toBe(6);
    expect(roles).toBe(5);
  });

  it('cria configurações padrão', () => {
    const row = db.prepare("SELECT value FROM settings WHERE key='platform.name'").get();
    expect(row?.value).toBe('HUB Institucional CADE');
  });

  it('cria targets de monitoramento', () => {
    const count = db.prepare('SELECT COUNT(*) AS n FROM monitoring_targets').get().n;
    expect(count).toBeGreaterThan(0);
  });

  it('foreign keys entre resources e categories são válidas', () => {
    const orphans = db
      .prepare('SELECT COUNT(*) AS n FROM resources r LEFT JOIN categories c ON r.category_id = c.id WHERE c.id IS NULL')
      .get().n;
    expect(orphans).toBe(0);
  });
});
