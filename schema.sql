-- Offer Machine — database schema (Neon Postgres)
-- Apply with: psql "$DATABASE_URL" -f schema.sql
-- (or paste into the Neon SQL editor)

CREATE TABLE IF NOT EXISTS generations (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,        -- nanoid(8)
  answers     JSONB NOT NULL,              -- wizard answers
  offer       JSONB NOT NULL,              -- Offer JSON (Call 1)
  page_config JSONB NOT NULL,              -- Page config JSON (Call 2)
  restyled    BOOLEAN DEFAULT FALSE,       -- whether regenerate-style was used
  ip_hash     TEXT NOT NULL,               -- sha256(ip + IP_SALT)
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Rate-limit lookup: count generations per ip_hash in the last 24h
CREATE INDEX IF NOT EXISTS generations_ip_hash_created_at_idx
  ON generations (ip_hash, created_at);
