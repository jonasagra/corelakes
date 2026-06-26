-- ── Migração de endurecimento ─────────────────────────────────
-- Rode no Neon SE você já tinha criado as tabelas com um schema.sql antigo.
-- É seguro rodar mais de uma vez (tudo com IF NOT EXISTS).

-- Revogação de sessão
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 1;

-- 2FA (TOTP)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS totp_secret TEXT;
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN NOT NULL DEFAULT false;

-- Limite de tentativas de login (anti força-bruta)
CREATE TABLE IF NOT EXISTS login_attempts (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip           TEXT        NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS login_attempts_ip_time_idx
  ON login_attempts (ip, attempted_at);
