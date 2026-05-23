-- Adds allow_payment_delete toggle to app_settings.
-- Safe / additive — run once against Supabase.

BEGIN;

ALTER TABLE app_settings
  ADD COLUMN IF NOT EXISTS allow_payment_delete BOOLEAN NOT NULL DEFAULT FALSE;

COMMIT;
