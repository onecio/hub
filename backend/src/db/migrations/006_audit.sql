-- 006_audit.sql — Incidentes de SI, audit log imutável encadeado e configurações

CREATE TABLE IF NOT EXISTS incidents (
  id                  TEXT PRIMARY KEY,
  reporter_id         TEXT REFERENCES users(id) ON DELETE SET NULL,
  anonymous           INTEGER NOT NULL DEFAULT 0 CHECK (anonymous IN (0, 1)),
  category            TEXT    NOT NULL
                      CHECK (category IN ('phishing', 'malware', 'unauthorized_access',
                                          'data_leak', 'social_engineering', 'other')),
  severity            TEXT    NOT NULL DEFAULT 'medium'
                      CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title               TEXT    NOT NULL,
  description         TEXT    NOT NULL,
  evidence_files_json TEXT    NOT NULL DEFAULT '[]',
  status              TEXT    NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open', 'investigating', 'resolved', 'closed', 'false_positive')),
  assigned_to         TEXT    REFERENCES users(id) ON DELETE SET NULL,
  resolved_at         TEXT,
  created_at          TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at          TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at          TEXT
);

CREATE INDEX IF NOT EXISTS idx_incidents_status   ON incidents (status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_incidents_reporter ON incidents (reporter_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_incidents_assigned ON incidents (assigned_to) WHERE deleted_at IS NULL;

-- Hash chain: sequence calculado pela aplicação (MAX(sequence)+1), não AUTOINCREMENT
-- para garantir integridade da cadeia na camada da aplicação.
CREATE TABLE IF NOT EXISTS audit_log (
  id            TEXT    PRIMARY KEY,
  sequence      INTEGER NOT NULL UNIQUE,
  timestamp     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  actor_id      TEXT,
  actor_ip      TEXT,
  actor_agent   TEXT,
  action        TEXT    NOT NULL,
  target_type   TEXT,
  target_id     TEXT,
  payload_json  TEXT    NOT NULL DEFAULT '{}',
  previous_hash TEXT,
  current_hash  TEXT    NOT NULL,
  success       INTEGER NOT NULL DEFAULT 1 CHECK (success IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_audit_log_sequence   ON audit_log (sequence DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor      ON audit_log (actor_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_target     ON audit_log (target_type, target_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action     ON audit_log (action, timestamp DESC);

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'string'
             CHECK (type IN ('string', 'integer', 'boolean', 'json')),
  updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
