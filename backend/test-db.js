import { getDb } from './src/db/connection.js';

try {
  const db = getDb();
  const categories = db.prepare('SELECT * FROM categories LIMIT 1').all();
  console.log('Categories found:', categories.length);
  console.log('First category:', categories[0]);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
