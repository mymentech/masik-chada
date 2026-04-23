-- =============================================================================
-- Masik Chada – Supabase (PostgreSQL) Schema
-- Run this in the Supabase SQL editor (or via psql) on a fresh project.
-- =============================================================================

-- Users -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          BIGSERIAL    PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Donors ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS donors (
  id                BIGSERIAL      PRIMARY KEY,
  serial_number     INTEGER        NOT NULL UNIQUE,
  name              VARCHAR(255)   NOT NULL,
  phone             VARCHAR(255)   NOT NULL DEFAULT '+880',
  address           VARCHAR(255)   NOT NULL,
  monthly_amount    DECIMAL(10,2)  NOT NULL,
  registration_date TIMESTAMPTZ    NOT NULL,
  due_from          TIMESTAMPTZ    DEFAULT NULL,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Payments --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id            BIGSERIAL      PRIMARY KEY,
  donor_id      BIGINT         NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  collector_id  BIGINT         NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  amount        DECIMAL(10,2)  NOT NULL,
  payment_date  TIMESTAMPTZ    NOT NULL,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Monthly donor snapshots -----------------------------------------------------
CREATE TABLE IF NOT EXISTS monthly_donor_snapshots (
  id          BIGSERIAL      PRIMARY KEY,
  donor_id    BIGINT         NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  month_key   CHAR(7)        NOT NULL,          -- e.g. '2025-01'
  total_due   DECIMAL(10,2)  NOT NULL,
  total_paid  DECIMAL(10,2)  NOT NULL,
  balance     DECIMAL(10,2)  NOT NULL,
  computed_at TIMESTAMPTZ    NOT NULL,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  UNIQUE (donor_id, month_key)
);

-- Monthly job runs ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monthly_job_runs (
  id                    BIGSERIAL    PRIMARY KEY,
  job_key               VARCHAR(255) NOT NULL,
  month_key             CHAR(7)      NOT NULL,
  total_donors_scanned  INTEGER      NOT NULL DEFAULT 0,
  successful_writes     INTEGER      NOT NULL DEFAULT 0,
  failed_donors         INTEGER      NOT NULL DEFAULT 0,
  duration_ms           INTEGER      NOT NULL DEFAULT 0,
  failed_donor_ids      TEXT[]       NOT NULL DEFAULT '{}',
  started_at            TIMESTAMPTZ  NOT NULL,
  finished_at           TIMESTAMPTZ  NOT NULL,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (job_key, month_key)
);

-- Donor serial number sequence ------------------------------------------------
-- Used by the backend to allocate serial_number values atomically.
-- After importing historical data run:
--   SELECT setval('donor_serial_seq', (SELECT MAX(serial_number) FROM donors));
CREATE SEQUENCE IF NOT EXISTS donor_serial_seq START 1;

-- Indexes ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_donors_address           ON donors(address);
CREATE INDEX IF NOT EXISTS idx_donors_serial_number     ON donors(serial_number);
CREATE INDEX IF NOT EXISTS idx_payments_donor_id        ON payments(donor_id);
CREATE INDEX IF NOT EXISTS idx_payments_collector_id    ON payments(collector_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date    ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_snapshots_month_key      ON monthly_donor_snapshots(month_key);
CREATE INDEX IF NOT EXISTS idx_job_runs_job_key         ON monthly_job_runs(job_key);
CREATE INDEX IF NOT EXISTS idx_job_runs_month_key       ON monthly_job_runs(month_key);
