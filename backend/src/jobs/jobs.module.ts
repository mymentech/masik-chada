import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donor } from '../donors/entities/donor.entity';
import { Payment } from '../payments/entities/payment.entity';
import { MonthlyDonorSnapshot } from './entities/monthly-donor-snapshot.entity';
import { MonthlyJobRun } from './entities/monthly-job-run.entity';
import { MonthlySnapshotScheduler } from './monthly-snapshot.scheduler';
import { MonthlySnapshotService } from './monthly-snapshot.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Donor, Payment, MonthlyDonorSnapshot, MonthlyJobRun]),
  ],
  providers: [MonthlySnapshotService, MonthlySnapshotScheduler],
  exports: [MonthlySnapshotService, MonthlySnapshotScheduler],
})
export class JobsModule {}
