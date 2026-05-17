-- 004_monitoring.sql — Targets de monitoramento, checks e incidentes de disponibilidade

CREATE TABLE IF NOT EXISTS monitoring_targets (
  id               TEXT    PRIMARY KEY,
  name             TEXT    NOT NULL,
  url              TEXT    NOT NULL,
  type             TEXT    NOT NULL DEFAULT 'http'
                   CHECK (type IN ('http', 'tcp', 'ping')),
  expected_status  INTEGER NOT NULL DEFAULT 200,
  timeout_ms       INTEGER NOT NULL DEFAULT 10000,
  interval_seconds INTEGER NOT NULL DEFAULT 60,
  category         TEXT,
  criticality      TEXT    NOT NULL DEFAULT 'medium'
                   CHECK (criticality IN ('low', 'medium', 'high', 'critical')),
  active           INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at       TEXT
);

CREATE INDEX IF NOT EXISTS idx_monitoring_targets_active ON monitoring_targets (active) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS monitoring_checks (
  id            TEXT    PRIMARY KEY,
  target_id     TEXT    NOT NULL REFERENCES monitoring_targets(id) ON DELETE CASCADE,
  checked_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  status        TEXT    NOT NULL CHECK (status IN ('up', 'down', 'degraded', 'timeout', 'error')),
  latency_ms    INTEGER,
  status_code   INTEGER,
  error_message TEXT,
  region        TEXT    NOT NULL DEFAULT 'local'
);

CREATE INDEX IF NOT EXISTS idx_monitoring_checks_target  ON monitoring_checks (target_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_monitoring_checks_status  ON monitoring_checks (status, checked_at DESC);

CREATE TABLE IF NOT EXISTS monitoring_incidents (
  id          TEXT PRIMARY KEY,
  target_id   TEXT NOT NULL REFERENCES monitoring_targets(id) ON DELETE CASCADE,
  started_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ended_at    TEXT,
  severity    TEXT NOT NULL DEFAULT 'medium'
              CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  resolved_by TEXT REFERENCES users(id),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_monitoring_incidents_target ON monitoring_incidents (target_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_incidents_open   ON monitoring_incidents (ended_at) WHERE ended_at IS NULL;
