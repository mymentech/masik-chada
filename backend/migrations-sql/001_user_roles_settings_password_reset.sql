-- Adds role + phone to users, app_settings (single row), password_reset_tokens.
-- Safe / additive — run once against Supabase.

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) NOT NULL DEFAULT 'collector';
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(255) NOT NULL DEFAULT '+880';

-- Designate the first app owner as admin. Safe no-op if the email isn't present.
UPDATE users SET role = 'admin' WHERE email = 'mymentech@gmail.com';

CREATE TABLE IF NOT EXISTS app_settings (
  id INT PRIMARY KEY DEFAULT 1,
  allow_donor_delete BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT app_settings_single_row CHECK (id = 1)
);

INSERT INTO app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(128) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS password_reset_tokens_user_idx ON password_reset_tokens(user_id);

COMMIT;
