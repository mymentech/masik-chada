#!/usr/bin/env node
/**
 * generate-pg-inserts.js
 *
 * Reads the MySQL dump (u947130940_subscription.sql) and writes a
 * PostgreSQL-compatible data-migration SQL file to stdout (or a file).
 *
 * Usage:
 *   node scripts/generate-pg-inserts.js u947130940_subscription.sql > scripts/supabase-data.sql
 *
 * What it migrates:
 *   - users    (id, name, email, password, created_at)
 *   - donors   (id, serial_number, name, phone, address, monthly_amount,
 *               registration_date, due_from, created_at, updated_at)
 *   - payments (id, donor_id, collector_id, amount, payment_date, created_at)
 *              — due_id is intentionally dropped (not used in new schema)
 *
 * After running this script, apply the output SQL in the Supabase SQL editor
 * (or via psql) AFTER running scripts/supabase-schema.sql.
 */

'use strict';

const fs = require('fs');

// ---------------------------------------------------------------------------
// SQL parser (same logic as migrate-sql-to-mongo.ts)
// ---------------------------------------------------------------------------

/** @typedef {Record<string, string|null>} Row */

/**
 * Parse all INSERT blocks for a given table from a MySQL dump.
 * @param {string} sql
 * @param {string} tableName
 * @returns {Row[]}
 */
function parseSqlTable(sql, tableName) {
  const results = [];
  const headerRe = new RegExp(
    `INSERT INTO \\\`${tableName}\\\` \\\\(([^)]+)\\\\) VALUES\\\\s*\\n`,
    'g',
  );

  // Simpler: split by INSERT INTO `tableName` blocks
  const insertRe = new RegExp(
    `INSERT INTO \`${tableName}\` \\(([^)]+)\\) VALUES[\\s\\S]*?;`,
    'g',
  );

  let m;
  while ((m = insertRe.exec(sql)) !== null) {
    const block = m[0];
    const columns = m[1]
      .split(',')
      .map((c) => c.trim().replace(/`/g, ''));

    // Find start of values
    const valuesStart = block.indexOf(') VALUES') + ') VALUES'.length;
    let pos = valuesStart;
    const blockLen = block.length;

    while (pos < blockLen) {
      while (pos < blockLen && block[pos] !== '(' && block[pos] !== ';') pos++;
      if (pos >= blockLen || block[pos] === ';') break;

      const [values, nextPos] = parseTuple(block, pos);
      pos = nextPos;

      if (values.length === columns.length) {
        /** @type {Row} */
        const row = {};
        columns.forEach((col, i) => (row[col] = values[i]));
        results.push(row);
      }

      while (
        pos < blockLen &&
        (block[pos] === ',' ||
          block[pos] === '\n' ||
          block[pos] === '\r' ||
          block[pos] === ' ')
      ) {
        if (block[pos] === ';') break;
        pos++;
      }
    }
  }

  return results;
}

/**
 * Parse one `(v1, v2, ...)` tuple starting at pos (must be '(').
 * @param {string} sql
 * @param {number} pos
 * @returns {[(string|null)[], number]}
 */
function parseTuple(sql, pos) {
  /** @type {(string|null)[]} */
  const values = [];
  pos++; // skip '('

  while (pos < sql.length && sql[pos] !== ')') {
    while (
      pos < sql.length &&
      (sql[pos] === ' ' || sql[pos] === '\n' || sql[pos] === '\r')
    )
      pos++;

    if (sql[pos] === "'") {
      pos++;
      let str = '';
      while (pos < sql.length) {
        const ch = sql[pos];
        if (ch === '\\' && pos + 1 < sql.length) {
          pos++;
          str += sql[pos++];
        } else if (ch === "'" && sql[pos + 1] === "'") {
          str += "'";
          pos += 2;
        } else if (ch === "'") {
          pos++;
          break;
        } else {
          str += ch;
          pos++;
        }
      }
      values.push(str);
    } else if (sql.substring(pos, pos + 4) === 'NULL') {
      values.push(null);
      pos += 4;
    } else {
      let raw = '';
      while (pos < sql.length && sql[pos] !== ',' && sql[pos] !== ')') {
        raw += sql[pos++];
      }
      values.push(raw.trim());
    }

    while (
      pos < sql.length &&
      (sql[pos] === ' ' || sql[pos] === '\n' || sql[pos] === '\r')
    )
      pos++;
    if (pos < sql.length && sql[pos] === ',') pos++;
  }

  if (pos < sql.length && sql[pos] === ')') pos++;
  return [values, pos];
}

// ---------------------------------------------------------------------------
// PostgreSQL escape helpers
// ---------------------------------------------------------------------------

/**
 * Escape a value for a PostgreSQL literal.
 * @param {string|null} val
 * @returns {string}
 */
function pgLit(val) {
  if (val === null) return 'NULL';
  // Escape single quotes by doubling them
  return "'" + val.replace(/'/g, "''") + "'";
}

/**
 * Format a numeric value (as-is, no quoting needed).
 * @param {string|null} val
 * @returns {string}
 */
function pgNum(val) {
  if (val === null) return 'NULL';
  return val;
}

/**
 * Format a timestamptz literal from a MySQL YYYY-MM-DD or YYYY-MM-DD HH:MM:SS value.
 * @param {string|null} val
 * @returns {string}
 */
function pgTs(val) {
  if (val === null) return 'NULL';
  // Append UTC if no timezone info
  return `'${val} UTC'`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const sqlPath = process.argv[2];
if (!sqlPath) {
  console.error(
    'Usage: node scripts/generate-pg-inserts.js <path-to-mysql-dump.sql>',
  );
  process.exit(1);
}

if (!fs.existsSync(sqlPath)) {
  console.error(`File not found: ${sqlPath}`);
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, 'utf8');
const lines = [];

lines.push('-- =============================================================================');
lines.push('-- Masik Chada – Supabase data migration');
lines.push('-- Generated by scripts/generate-pg-inserts.js');
lines.push('-- Apply AFTER running scripts/supabase-schema.sql');
lines.push('-- =============================================================================');
lines.push('');
lines.push('BEGIN;');
lines.push('');

// ---------------------------------------------------------------------------
// 1. Users
// ---------------------------------------------------------------------------
const users = parseSqlTable(sql, 'users');
process.stderr.write(`Parsed ${users.length} users\n`);

lines.push('-- Users -----------------------------------------------------------------------');
lines.push('INSERT INTO users (id, name, email, password, created_at) VALUES');

const userRows = users.map((u) => {
  const id = pgNum(u['id']);
  const name = pgLit(u['name']);
  const email = pgLit((u['email'] ?? '').toLowerCase().trim());
  const password = pgLit(u['password']);
  const createdAt = pgTs(u['created_at']);
  return `  (${id}, ${name}, ${email}, ${password}, ${createdAt})`;
});

lines.push(userRows.join(',\n') + ';');
lines.push('');

// ---------------------------------------------------------------------------
// 2. Donors
// ---------------------------------------------------------------------------
const donors = parseSqlTable(sql, 'donors');
process.stderr.write(`Parsed ${donors.length} donors\n`);

lines.push('-- Donors ----------------------------------------------------------------------');
lines.push(
  'INSERT INTO donors (id, serial_number, name, phone, address, monthly_amount, registration_date, due_from, created_at, updated_at) VALUES',
);

const donorRows = donors.map((d) => {
  const id = pgNum(d['id']);
  const serial = pgNum(d['serial_number']);
  const name = pgLit(d['name']);
  const phone = pgLit(d['phone'] ?? '+880');
  const address = pgLit(d['address']);
  const amount = pgNum(d['monthly_amount']);
  const regDate = pgTs(d['registration_date']);
  const dueFrom = 'NULL'; // not present in MySQL schema
  const createdAt = pgTs(d['created_at']);
  const updatedAt = pgTs(d['updated_at']);
  return `  (${id}, ${serial}, ${name}, ${phone}, ${address}, ${amount}, ${regDate}, ${dueFrom}, ${createdAt}, ${updatedAt})`;
});

lines.push(donorRows.join(',\n') + ';');
lines.push('');

// ---------------------------------------------------------------------------
// 3. Payments
// ---------------------------------------------------------------------------
const payments = parseSqlTable(sql, 'payments');
process.stderr.write(`Parsed ${payments.length} payments\n`);

lines.push('-- Payments --------------------------------------------------------------------');
lines.push(
  'INSERT INTO payments (id, donor_id, collector_id, amount, payment_date, created_at) VALUES',
);

const paymentRows = payments.map((p) => {
  const id = pgNum(p['id']);
  const donorId = pgNum(p['donor_id']);
  const collectorId = pgNum(p['collector_id']);
  const amount = pgNum(p['amount']);
  const paymentDate = pgTs(p['payment_date']);
  const createdAt = pgTs(p['created_at']);
  return `  (${id}, ${donorId}, ${collectorId}, ${amount}, ${paymentDate}, ${createdAt})`;
});

lines.push(paymentRows.join(',\n') + ';');
lines.push('');

// ---------------------------------------------------------------------------
// 4. Reset sequences
// ---------------------------------------------------------------------------
lines.push('-- Reset sequences so next INSERT gets the correct auto-increment value ----------');
lines.push(
  `SELECT setval(pg_get_serial_sequence('users', 'id'),    GREATEST((SELECT MAX(id) FROM users),    1));`,
);
lines.push(
  `SELECT setval(pg_get_serial_sequence('donors', 'id'),   GREATEST((SELECT MAX(id) FROM donors),   1));`,
);
lines.push(
  `SELECT setval(pg_get_serial_sequence('payments', 'id'), GREATEST((SELECT MAX(id) FROM payments), 1));`,
);
lines.push(
  `SELECT setval('donor_serial_seq', GREATEST((SELECT MAX(serial_number) FROM donors), 1));`,
);
lines.push('');
lines.push('COMMIT;');
lines.push('');
lines.push('-- Done ------------------------------------------------------------------------');
lines.push(
  `-- Migrated: ${users.length} users, ${donors.length} donors, ${payments.length} payments`,
);

process.stdout.write(lines.join('\n') + '\n');
process.stderr.write('Done. Pipe stdout to a .sql file and run it in Supabase.\n');
