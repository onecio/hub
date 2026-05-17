-- 002_resources.sql — Catálogo de recursos e categorias

CREATE TABLE IF NOT EXISTS categories (
  id          TEXT    PRIMARY KEY,
  slug        TEXT    NOT NULL UNIQUE,
  name        TEXT    NOT NULL,
  icon        TEXT,
  color       TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_categories_slug   ON categories (slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories (active, order_index);

CREATE TABLE IF NOT EXISTS resources (
  id            TEXT    PRIMARY KEY,
  name          TEXT    NOT NULL,
  slug          TEXT    NOT NULL UNIQUE,
  description   TEXT,
  url           TEXT    NOT NULL,
  category_id   TEXT    NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  icon_svg      TEXT,
  order_index   INTEGER NOT NULL DEFAULT 0,
  status        TEXT    NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'inactive', 'maintenance')),
  is_new        INTEGER NOT NULL DEFAULT 0 CHECK (is_new IN (0, 1)),
  is_external   INTEGER NOT NULL DEFAULT 1 CHECK (is_external IN (0, 1)),
  requires_auth INTEGER NOT NULL DEFAULT 0 CHECK (requires_auth IN (0, 1)),
  visibility    TEXT    NOT NULL DEFAULT 'all'
                CHECK (visibility IN ('all', 'authenticated', 'admin', 'privileged')),
  created_by    TEXT    REFERENCES users(id),
  created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_resources_category ON resources (category_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_resources_slug     ON resources (slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_resources_status   ON resources (status, visibility) WHERE deleted_at IS NULL;
