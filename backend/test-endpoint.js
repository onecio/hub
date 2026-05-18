import { getDb } from './src/db/connection.js';
import * as resourceSchemas from './src/schemas/resources.js';

try {
  const validation = resourceSchemas.schemas.categoryList.safeParse({});
  console.log('Validation success:', validation.success);
  
  if (validation.success) {
    const categories = getDb().prepare(`
      SELECT id, name, icon, color, order_index
      FROM categories
      WHERE deleted_at IS NULL AND active = 1
      ORDER BY order_index ASC
    `).all();
    console.log('Categories:', categories);
  } else {
    console.log('Validation error:', validation.error);
  }
} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
