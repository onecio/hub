import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, 'migrations');

const CREATE_MIGRATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS _migrations (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT    NOT NULL UNIQUE,
    checksum TEXT    NOT NULL,
    applied_at TEXT  NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )
`;

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

export function runMigrations(db) {
  db.exec(CREATE_MIGRATIONS_TABLE);

  const applied = new Map(
    db.prepare('SELECT filename, checksum FROM _migrations ORDER BY id').all().map((r) => [r.filename, r.checksum]),
  );

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const insert = db.prepare('INSERT INTO _migrations (filename, checksum) VALUES (?, ?)');

  const runAll = db.transaction(() => {
    for (const file of files) {
      const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
      const checksum = sha256(sql);

      if (applied.has(file)) {
        if (applied.get(file) !== checksum) {
          throw new Error(`Migration tampered: ${file} — checksum mismatch`);
        }
        continue;
      }

      db.exec(sql);
      insert.run(file, checksum);
    }
  });

  runAll();
}

// CLI: node src/db/migrate.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { getDb } = await import('./connection.js');
  const db = getDb();
  runMigrations(db);
  console.log('Migrations applied successfully.');
}
