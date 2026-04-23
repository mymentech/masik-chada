import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';

async function run() {
  const logger = new Logger('AddPerformanceIndexes');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);

    logger.log('Ensuring pg_trgm extension exists...');
    await dataSource.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    logger.log('Creating donor and payment indexes for pagination/filter/report queries...');
    await dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_donors_address_serial
      ON donors (address, serial_number)
    `);
    await dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_donors_name_trgm
      ON donors USING gin (lower(name) gin_trgm_ops)
    `);
    await dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_donor_payment_date
      ON payments (donor_id, payment_date DESC)
    `);
    await dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_collector_payment_date
      ON payments (collector_id, payment_date DESC)
    `);
    await dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_payment_date
      ON payments (payment_date DESC)
    `);

    logger.log('Performance indexes ensured successfully.');
  } finally {
    await app.close();
  }
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
