import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MonthlySnapshotService } from './monthly-snapshot.service';

async function run() {
  const logger = new Logger('MonthlySnapshotJobRunner');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'error', 'warn'] });

  try {
    const service = app.get(MonthlySnapshotService);
    const monthArg = process.argv[2];
    const result = await service.runForMonth(monthArg);
    logger.log(
      `month=${result.month_key} scanned=${result.total_donors_scanned} success=${result.successful_writes} failed=${result.failed_donors} durationMs=${result.duration_ms}`,
    );
  } finally {
    await app.close();
  }
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
