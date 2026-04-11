import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Donor, DonorSchema } from '../donors/schemas/donor.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { MonthlySnapshotScheduler } from './monthly-snapshot.scheduler';
import { MonthlySnapshotService } from './monthly-snapshot.service';
import {
  MonthlyDonorSnapshot,
  MonthlyDonorSnapshotSchema,
} from './schemas/monthly-donor-snapshot.schema';
import { MonthlyJobRun, MonthlyJobRunSchema } from './schemas/monthly-job-run.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Donor.name, schema: DonorSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: MonthlyDonorSnapshot.name, schema: MonthlyDonorSnapshotSchema },
      { name: MonthlyJobRun.name, schema: MonthlyJobRunSchema },
    ]),
  ],
  providers: [MonthlySnapshotService, MonthlySnapshotScheduler],
  exports: [MonthlySnapshotService],
})
export class JobsModule {}
