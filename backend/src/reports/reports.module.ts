import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donor } from '../donors/entities/donor.entity';
import { DonorsModule } from '../donors/donors.module';
import { Payment } from '../payments/entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { ReportsService } from './reports.service';

@Module({
  imports: [DonorsModule, TypeOrmModule.forFeature([Payment, User, Donor])],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
