import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DonorsService } from '../donors/donors.service';

async function run() {
  const logger = new Logger('SyncDonorSerialCounter');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'error', 'warn'] });

  try {
    const donorsService = app.get(DonorsService);
    const maxSerial = await donorsService.syncSerialCounterWithCurrentMax();
    logger.log(`donor_serial counter synchronized to ${maxSerial}`);
  } finally {
    await app.close();
  }
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
