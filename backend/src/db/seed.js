// CLI: npm run seed
import { getDb } from './connection.js';
import { runMigrations } from './migrate.js';
import { runSeeds } from './seeds/index.js';

const db = getDb();
runMigrations(db);
runSeeds(db);
console.log('Seeds aplicados com sucesso.');
