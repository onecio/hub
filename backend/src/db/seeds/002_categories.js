import { deterministicId } from '../../utils/id.js';

const categories = [
  { slug: 'institucional',  name: 'Institucional',  icon: 'building',   color: '#3B6BFF', order_index: 1 },
  { slug: 'produtividade',  name: 'Produtividade',  icon: 'briefcase',  color: '#10B981', order_index: 2 },
  { slug: 'governo',        name: 'Governo Federal', icon: 'landmark',  color: '#D97706', order_index: 3 },
  { slug: 'seguranca',      name: 'Segurança e Privacidade', icon: 'shield', color: '#DC2626', order_index: 4 },
  { slug: 'financeiro',     name: 'Financeiro',     icon: 'bank',       color: '#0EA5E9', order_index: 5 },
  { slug: 'ferramentas',    name: 'Ferramentas',    icon: 'wrench',     color: '#8B5CF6', order_index: 6 },
];

export function seed(db) {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO categories (id, slug, name, icon, color, order_index, active)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
  );

  for (const cat of categories) {
    insert.run(deterministicId(`category:${cat.slug}`), cat.slug, cat.name, cat.icon, cat.color, cat.order_index);
  }
}
