import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonorsModule } from '../donors/donors.module';
import { Payment } from '../payments/entities/payment.entity';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [DonorsModule, TypeOrmModule.forFeature([Payment])],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
