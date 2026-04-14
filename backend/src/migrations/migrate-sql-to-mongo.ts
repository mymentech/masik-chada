/**
 * One-time SQL → MongoDB migration.
 *
 * Usage (inside container after docker cp of the SQL file):
 *   node dist/migrations/migrate-sql-to-mongo.js <path-to-sql-file> [--dry-run]
 *
 * Import order: users → donors → payments → sync serial counter
 */

import { MongoClient, ObjectId } from 'mongodb';
import * as fs from 'fs';

// ---------------------------------------------------------------------------
// SQL parser
// ---------------------------------------------------------------------------

type Row = Record<string, string | null>;

/** Parse all INSERT blocks for a given table name from a MySQL dump. */
function parseSqlTable(sql: string, tableName: string): Row[] {
  const results: Row[] = [];
  const headerRe = new RegExp(
    `INSERT INTO \`${tableName}\` \\(([^)]+)\\) VALUES\\s*\n`,
    'g',
  );

  let headerMatch: RegExpExecArray | null;
  while ((headerMatch = headerRe.exec(sql)) !== null) {
    const columns = headerMatch[1]
      .split(',')
      .map((c) => c.trim().replace(/`/g, ''));

    let pos = headerMatch.index + headerMatch[0].length;

    while (pos < sql.length) {
      while (pos < sql.length && sql[pos] !== '(' && sql[pos] !== ';') pos++;
      if (pos >= sql.length || sql[pos] === ';') break;

      const [values, nextPos] = parseTuple(sql, pos);
      pos = nextPos;

      if (values.length === columns.length) {
        const row: Row = {};
        columns.forEach((col, i) => (row[col] = values[i]));
        results.push(row);
      }

      while (
        pos < sql.length &&
        (sql[pos] === ',' || sql[pos] === '\n' || sql[pos] === '\r' || sql[pos] === ' ')
      ) {
        if (sql[pos] === ';') break;
        pos++;
      }
    }
  }

  return results;
}

/**
 * Parse one `(v1, v2, ...)` tuple starting at pos (which must be '(').
 * Returns [values, posAfterClosingParen].
 */
function parseTuple(sql: string, pos: number): [(string | null)[], number] {
  const values: (string | null)[] = [];
  pos++; // skip '('

  while (pos < sql.length && sql[pos] !== ')') {
    while (pos < sql.length && (sql[pos] === ' ' || sql[pos] === '\n' || sql[pos] === '\r')) pos++;

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

    while (pos < sql.length && (sql[pos] === ' ' || sql[pos] === '\n' || sql[pos] === '\r')) pos++;
    if (pos < sql.length && sql[pos] === ',') pos++;
  }

  if (pos < sql.length && sql[pos] === ')') pos++;
  return [values, pos];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toDate(val: string | null, fallback = new Date()): Date {
  if (!val) return fallback;
  const d = new Date(val);
  return isNaN(d.getTime()) ? fallback : d;
}

function toFloat(val: string | null): number {
  return val !== null ? parseFloat(val) : 0;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run() {
  const sqlPath = process.argv[2];
  const dryRun = process.argv.includes('--dry-run');

  if (!sqlPath) {
    console.error('Usage: node dist/migrations/migrate-sql-to-mongo.js <sql-file> [--dry-run]');
    process.exit(1);
  }

  if (!fs.existsSync(sqlPath)) {
    console.error(`SQL file not found: ${sqlPath}`);
    process.exit(1);
  }

  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'APPLY'}`);
  console.log(`Reading SQL dump: ${sqlPath}`);
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const mongoUri = process.env.MONGO_URI ?? 'mongodb://masik_db:27017/masik_db';
  console.log(`Connecting to: ${mongoUri}\n`);

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db();

  const usersCol = db.collection('users');
  const donorsCol = db.collection('donors');
  const paymentsCol = db.collection('payments');
  const countersCol = db.collection('counters');

  const now = new Date();
  const report = {
    mode: dryRun ? 'dry_run' : 'apply',
    users: { sql: 0, inserted: 0, updated: 0 },
    donors: { sql: 0, inserted: 0, updated: 0, warnings: [] as string[] },
    payments: { sql: 0, inserted: 0, updated: 0, orphans: 0 },
  };

  try {
    // -----------------------------------------------------------------------
    // 1. Users
    // -----------------------------------------------------------------------
    console.log('--- Users ---');
    const sqlUsers = parseSqlTable(sql, 'users');
    report.users.sql = sqlUsers.length;
    console.log(`  ${sqlUsers.length} rows in SQL dump`);

    const userIdMap = new Map<string, ObjectId>(); // legacy id → mongo ObjectId

    for (const u of sqlUsers) {
      const email = (u['email'] ?? '').toLowerCase().trim();
      if (!email) continue;

      const doc = {
        name: u['name'] ?? '',
        email,
        password: u['password'] ?? '',
        created_at: toDate(u['created_at'], now),
      };

      if (!dryRun) {
        const result = await usersCol.updateOne(
          { email },
          { $set: doc, $setOnInsert: { _id: new ObjectId() } },
          { upsert: true },
        );
        if (result.upsertedId) {
          userIdMap.set(u['id']!, result.upsertedId as ObjectId);
          report.users.inserted++;
        } else {
          const existing = await usersCol.findOne({ email }, { projection: { _id: 1 } });
          userIdMap.set(u['id']!, existing!._id as ObjectId);
          report.users.updated++;
        }
      } else {
        userIdMap.set(u['id']!, new ObjectId());
        report.users.inserted++;
      }
    }
    console.log(`  inserted=${report.users.inserted} updated=${report.users.updated}\n`);

    // -----------------------------------------------------------------------
    // 2. Donors
    // -----------------------------------------------------------------------
    console.log('--- Donors ---');
    const sqlDonors = parseSqlTable(sql, 'donors');
    report.donors.sql = sqlDonors.length;
    console.log(`  ${sqlDonors.length} rows in SQL dump`);

    const donorIdMap = new Map<string, ObjectId>(); // legacy id → mongo ObjectId

    for (const d of sqlDonors) {
      const serial = parseInt(d['serial_number'] ?? '0', 10);
      const monthlyAmount = toFloat(d['monthly_amount']);

      if (monthlyAmount === 0) {
        const warn = `Donor serial=${serial} (legacy_id=${d['id']}) has monthly_amount=0 — imported as-is`;
        report.donors.warnings.push(warn);
        console.warn(`  WARN: ${warn}`);
      }

      const doc = {
        serial_number: serial,
        name: d['name'] ?? '',
        phone: d['phone'] ?? '+880',
        address: d['address'] ?? '',
        monthly_amount: monthlyAmount,
        registration_date: toDate(d['registration_date'], now),
        due_from: null,
        created_at: toDate(d['created_at'], now),
        updated_at: toDate(d['updated_at'], now),
      };

      if (!dryRun) {
        const result = await donorsCol.updateOne(
          { serial_number: serial },
          { $set: doc, $setOnInsert: { _id: new ObjectId() } },
          { upsert: true },
        );
        if (result.upsertedId) {
          donorIdMap.set(d['id']!, result.upsertedId as ObjectId);
          report.donors.inserted++;
        } else {
          const existing = await donorsCol.findOne({ serial_number: serial }, { projection: { _id: 1 } });
          donorIdMap.set(d['id']!, existing!._id as ObjectId);
          report.donors.updated++;
        }
      } else {
        donorIdMap.set(d['id']!, new ObjectId());
        report.donors.inserted++;
      }
    }
    console.log(`  inserted=${report.donors.inserted} updated=${report.donors.updated}\n`);

    // -----------------------------------------------------------------------
    // 3. Payments
    // -----------------------------------------------------------------------
    console.log('--- Payments ---');
    const sqlPayments = parseSqlTable(sql, 'payments');
    report.payments.sql = sqlPayments.length;
    console.log(`  ${sqlPayments.length} rows in SQL dump`);

    for (const p of sqlPayments) {
      const legacyId = parseInt(p['id']!, 10);
      const donorMongoId = donorIdMap.get(p['donor_id'] ?? '');
      const collectorMongoId = userIdMap.get(p['collector_id'] ?? '');

      if (!donorMongoId || !collectorMongoId) {
        report.payments.orphans++;
        console.warn(
          `  WARN: Orphan payment legacy_id=${legacyId} — donor_id=${p['donor_id']} collector_id=${p['collector_id']}`,
        );
        continue;
      }

      const doc = {
        legacy_id: legacyId,
        donor_id: donorMongoId,
        collector_id: collectorMongoId,
        amount: toFloat(p['amount']),
        payment_date: toDate(p['payment_date'], now),
        created_at: toDate(p['created_at'], now),
      };

      if (!dryRun) {
        const result = await paymentsCol.updateOne(
          { legacy_id: legacyId },
          { $set: doc, $setOnInsert: { _id: new ObjectId() } },
          { upsert: true },
        );
        if (result.upsertedId) report.payments.inserted++;
        else report.payments.updated++;
      } else {
        report.payments.inserted++;
      }
    }
    console.log(`  inserted=${report.payments.inserted} updated=${report.payments.updated} orphans=${report.payments.orphans}\n`);

    // -----------------------------------------------------------------------
    // 4. Sync serial counter
    // -----------------------------------------------------------------------
    if (!dryRun) {
      const maxSerialDoc = await donorsCol.find({}).sort({ serial_number: -1 }).limit(1).toArray();
      const maxSerial = maxSerialDoc.length > 0 ? (maxSerialDoc[0].serial_number as number) : 0;
      await countersCol.updateOne(
        { key: 'donor_serial' },
        { $set: { value: maxSerial } },
        { upsert: true },
      );
      console.log(`Serial counter synced to ${maxSerial}`);
    }

    // -----------------------------------------------------------------------
    // Summary
    // -----------------------------------------------------------------------
    console.log('\n=== Summary ===');
    console.log(JSON.stringify(report, null, 2));
    console.log(dryRun ? '\nDRY RUN complete — no data written.' : '\nMigration complete.');
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
