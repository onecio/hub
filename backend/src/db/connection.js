import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from '../config/index.js';

let db;

export function getDb() {
  if (db) return db;

  if (config.DB_PATH !== ':memory:') {
    mkdirSync(dirname(config.DB_PATH), { recursive: true });
  }

  db = new Database(config.DB_PATH);

  // page_size e auto_vacuum devem preceder journal_mode = WAL e qualquer CREATE TABLE.
  // Em bancos existentes são no-op; em novos bancos definem a estrutura física.
  db.pragma('page_size = 4096');          // Compatível com filesystem; no-op se DB já existe
  db.pragma('auto_vacuum = INCREMENTAL'); // Deve preceder WAL; recuperação incremental de espaço

  db.pragma('journal_mode = WAL');        // Write-Ahead Logging: leituras não bloqueiam escrita
  db.pragma('foreign_keys = ON');         // Enforce FK constraints (por conexão, sempre necessário)
  db.pragma('secure_delete = ON');        // Sobrescreve conteúdo deletado com zeros (LGPD/segurança)
  db.pragma('synchronous = NORMAL');      // Balanço entre durabilidade e performance no modo WAL
  db.pragma('temp_store = MEMORY');       // Tabelas temporárias na memória
  db.pragma('mmap_size = 134217728');     // 128 MB de mmap para reads
  db.pragma('busy_timeout = 5000');       // Aguarda até 5 s em caso de lock (previne SQLITE_BUSY)

  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = undefined;
  }
}
