-- 001_users_rbac.sql — Usuários, sessões e controle de acesso baseado em papéis

CREATE TABLE IF NOT EXISTS users (
  id                TEXT    PRIMARY KEY,
  email             TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  name              TEXT    NOT NULL,
  registration      TEXT,
  password_hash     TEXT,
  mfa_secret_enc    TEXT,
  mfa_enabled       INTEGER NOT NULL DEFAULT 0 CHECK (mfa_enabled IN (0, 1)),
  backup_codes_enc  TEXT,
  status            TEXT    NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'inactive', 'locked', 'pending')),
  last_login_at     TEXT,
  failed_attempts   INTEGER NOT NULL DEFAULT 0,
  locked_until      TEXT,
  created_at        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at        TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email       ON users (email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_status      ON users (status) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS roles (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  level       INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS permissions (
  id          TEXT PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id    TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  granted_by TEXT REFERENCES users(id),
  granted_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  expires_at TEXT,
  PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles (user_id);

CREATE TABLE IF NOT EXISTS sessions (
  id                  TEXT PRIMARY KEY,
  user_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash  TEXT NOT NULL UNIQUE,
  ip                  TEXT NOT NULL,
  user_agent          TEXT,
  created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  expires_at          TEXT NOT NULL,
  revoked_at          TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_user       ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions (refresh_token_hash) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_expires    ON sessions (expires_at) WHERE revoked_at IS NULL;
