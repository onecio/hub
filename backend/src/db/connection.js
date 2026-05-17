import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from '../config/index.js';

let db;

export function getDb() {
  if (db) return db;

  mkdirSync(dirname(config.DB_PATH), { recursive: true });

  db = new Database(config.DB_PATH);

  // Configurações de performance e integridade (executadas uma vez na abertura)
  db.pragma('journal_mode = WAL');        // Write-Ahead Logging: leituras não bloqueiam escrita
  db.pragma('foreign_keys = ON');         // Enforce FK constraints
  db.pragma('synchronous = NORMAL');      // Balanço entre durabilidade e performance no modo WAL
  db.pragma('temp_store = MEMORY');       // Tabelas temporárias na memória
  db.pragma('mmap_size = 134217728');     // 128 MB de mmap para reads
  db.pragma('page_size = 4096');          // Tamanho de página compatível com filesystem
  db.pragma('auto_vacuum = INCREMENTAL'); // Recuperação incremental de espaço

  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = undefined;
  }
}
