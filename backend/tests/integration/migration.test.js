import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../../src/db/migrate.js';

function freshDb() {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  return db;
}

describe('Migration runner', () => {
  it('cria tabela _migrations na primeira execução', () => {
    const db = freshDb();
    runMigrations(db);
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='_migrations'").get();
    expect(row).toBeDefined();
  });

  it('é idempotente — segunda execução não falha', () => {
    const db = freshDb();
    expect(() => runMigrations(db)).not.toThrow();
    expect(() => runMigrations(db)).not.toThrow();
  });

  it('registra cada migration com checksum', () => {
    const db = freshDb();
    runMigrations(db);
    const rows = db.prepare('SELECT filename, checksum FROM _migrations ORDER BY id').all();
    expect(rows.length).toBeGreaterThanOrEqual(6);
    for (const row of rows) {
      expect(row.filename).toMatch(/^\d{3}_.*\.sql$/);
      expect(row.checksum).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it('lança erro se migration aplicada for adulterada', () => {
    const db = freshDb();
    runMigrations(db);
    db.prepare("UPDATE _migrations SET checksum='0000' WHERE filename='001_users_rbac.sql'").run();
    expect(() => runMigrations(db)).toThrow(/tampered/);
  });
});
