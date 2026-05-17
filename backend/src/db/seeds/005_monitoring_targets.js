import { deterministicId } from '../../utils/id.js';

const targets = [
  { name: 'HUB Backend',             url: 'http://backend:3000/health', type: 'http', expected_status: 200, timeout_ms: 5000,  interval_seconds: 30,  category: 'institucional', criticality: 'critical' },
  { name: 'SEI CADE',                url: 'https://sei.cade.gov.br',    type: 'http', expected_status: 200, timeout_ms: 10000, interval_seconds: 60,  category: 'institucional', criticality: 'critical' },
  { name: 'Intranet CADE',           url: 'https://intranet.cade.gov.br', type: 'http', expected_status: 200, timeout_ms: 10000, interval_seconds: 60, category: 'institucional', criticality: 'high' },
  { name: 'gov.br',                  url: 'https://www.gov.br',          type: 'http', expected_status: 200, timeout_ms: 15000, interval_seconds: 120, category: 'governo',       criticality: 'medium' },
  { name: 'Portal da Transparência', url: 'https://transparencia.gov.br', type: 'http', expected_status: 200, timeout_ms: 15000, interval_seconds: 120, category: 'governo',      criticality: 'low' },
  { name: 'ANPD',                    url: 'https://www.gov.br/anpd',     type: 'http', expected_status: 200, timeout_ms: 15000, interval_seconds: 120, category: 'seguranca',     criticality: 'medium' },
];

export function seed(db) {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO monitoring_targets
       (id, name, url, type, expected_status, timeout_ms, interval_seconds, category, criticality, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
  );

  for (const t of targets) {
    insert.run(
      deterministicId(`monitoring:${t.name}`),
      t.name, t.url, t.type,
      t.expected_status, t.timeout_ms, t.interval_seconds,
      t.category, t.criticality,
    );
  }
}
