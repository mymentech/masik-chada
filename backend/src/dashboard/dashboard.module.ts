import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DonorsModule } from '../donors/donors.module';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [DonorsModule, MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }])],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
