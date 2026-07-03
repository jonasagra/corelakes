-- ── Migração 002: CMS (rascunhos, categorias, destaque, views) ──
-- Rode este arquivo UMA VEZ no Neon (SQL Editor), em cima do banco existente.

-- Categorias (nome + cor; a cor pinta o badge no site e no admin)
CREATE TABLE IF NOT EXISTS categories (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  color      TEXT NOT NULL DEFAULT '#3c8527',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Novas colunas em posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status      TEXT    NOT NULL DEFAULT 'published';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured    BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS category_id BIGINT  REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views       INTEGER NOT NULL DEFAULT 0;

-- status só pode ser draft ou published
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;
ALTER TABLE posts ADD CONSTRAINT posts_status_check CHECK (status IN ('draft', 'published'));

CREATE INDEX IF NOT EXISTS posts_status_idx   ON posts (status);
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts (category_id);

-- Categorias iniciais (edite/adicione pelo painel depois)
INSERT INTO categories (name, slug, color) VALUES
  ('Notícias',      'noticias',      '#c0392b'),
  ('Atualizações',  'atualizacoes',  '#2980b9'),
  ('Wiki',          'wiki',          '#3c8527')
ON CONFLICT (name) DO NOTHING;
