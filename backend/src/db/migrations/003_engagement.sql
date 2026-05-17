-- 003_engagement.sql — Favoritos, histórico de acesso e preferências do usuário

CREATE TABLE IF NOT EXISTS favorites (
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user     ON favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_resource ON favorites (resource_id);

CREATE TABLE IF NOT EXISTS access_history (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  accessed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ip          TEXT,
  user_agent  TEXT
);

CREATE INDEX IF NOT EXISTS idx_access_history_user     ON access_history (user_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_history_resource ON access_history (resource_id);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id     TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  layout_json TEXT NOT NULL DEFAULT '{}',
  theme       TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
