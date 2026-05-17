const defaults = [
  { key: 'platform.name',              value: 'HUB Institucional CADE', type: 'string' },
  { key: 'platform.version',           value: '1.0.0',                  type: 'string' },
  { key: 'auth.session_duration_min',  value: '15',                     type: 'integer' },
  { key: 'auth.refresh_duration_days', value: '7',                      type: 'integer' },
  { key: 'auth.max_failed_attempts',   value: '5',                      type: 'integer' },
  { key: 'auth.lockout_minutes',       value: '15',                     type: 'integer' },
  { key: 'monitoring.enabled',         value: 'true',                   type: 'boolean' },
  { key: 'monitoring.default_interval_seconds', value: '60',            type: 'integer' },
  { key: 'shortlinks.max_per_user',    value: '100',                    type: 'integer' },
  { key: 'shortlinks.expiry_days',     value: '365',                    type: 'integer' },
  { key: 'audit.retention_years',      value: '5',                      type: 'integer' },
];

export function seed(db) {
  const insert = db.prepare(
    'INSERT OR IGNORE INTO settings (key, value, type) VALUES (?, ?, ?)',
  );

  for (const s of defaults) {
    insert.run(s.key, s.value, s.type);
  }
}
