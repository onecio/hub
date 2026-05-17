-- 005_tools.sql — Encurtador de links e auditoria de ferramentas

CREATE TABLE IF NOT EXISTS short_links (
  id            TEXT    PRIMARY KEY,
  slug          TEXT    NOT NULL UNIQUE,
  target_url    TEXT    NOT NULL,
  created_by    TEXT    REFERENCES users(id) ON DELETE SET NULL,
  expires_at    TEXT,
  max_clicks    INTEGER,
  click_count   INTEGER NOT NULL DEFAULT 0,
  password_hash TEXT,
  active        INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_short_links_slug    ON short_links (slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_short_links_creator ON short_links (created_by) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_short_links_expires ON short_links (expires_at) WHERE deleted_at IS NULL AND active = 1;

CREATE TABLE IF NOT EXISTS short_link_clicks (
  id            TEXT PRIMARY KEY,
  short_link_id TEXT NOT NULL REFERENCES short_links(id) ON DELETE CASCADE,
  clicked_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ip_hash       TEXT,
  user_agent_hash TEXT,
  referer_host  TEXT
);

CREATE INDEX IF NOT EXISTS idx_short_link_clicks_link ON short_link_clicks (short_link_id, clicked_at DESC);

CREATE TABLE IF NOT EXISTS tool_usage (
  id              TEXT PRIMARY KEY,
  tool_code       TEXT NOT NULL,
  user_id         TEXT REFERENCES users(id) ON DELETE SET NULL,
  parameters_hash TEXT,
  result_size     INTEGER,
  duration_ms     INTEGER,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_tool_usage_tool    ON tool_usage (tool_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_usage_user    ON tool_usage (user_id, created_at DESC);
