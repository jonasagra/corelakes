-- ── Schema do banco (Neon / Postgres) ─────────────────────────
-- Rode este arquivo uma vez no seu projeto Neon (SQL Editor ou psql).

-- Posts do blog
CREATE TABLE IF NOT EXISTS posts (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  content     TEXT        NOT NULL,
  excerpt     TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts (created_at DESC);

-- Usuários administradores (senha guardada como hash scrypt, nunca em texto)
-- token_version: incrementar invalida TODAS as sessões antigas do usuário
-- (mecanismo de "deslogar de todos os lugares" / revogar sessão).
-- totp_secret / totp_enabled: segundo fator (2FA) opcional via app autenticador.
CREATE TABLE IF NOT EXISTS users (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email          TEXT        NOT NULL UNIQUE,
  password_hash  TEXT        NOT NULL,
  token_version  INTEGER     NOT NULL DEFAULT 1,
  totp_secret    TEXT,
  totp_enabled   BOOLEAN     NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tentativas de login (para limitar força bruta por IP)
CREATE TABLE IF NOT EXISTS login_attempts (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip           TEXT        NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS login_attempts_ip_time_idx
  ON login_attempts (ip, attempted_at);
