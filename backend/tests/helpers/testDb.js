import Database from 'better-sqlite3';
import { runMigrations } from '../../src/db/migrate.js';

// Cria um banco em memória isolado por suite de testes.
// WAL não é suportado em :memory:, mas FK e secure_delete são aplicados.
export function createTestDb() {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  db.pragma('secure_delete = ON');
  runMigrations(db);
  return db;
}
