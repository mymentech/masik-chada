import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Counter, CounterSchema } from '../counters/schemas/counter.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { DonorsService } from './donors.service';
import { Donor, DonorSchema } from './schemas/donor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Donor.name, schema: DonorSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Counter.name, schema: CounterSchema },
    ]),
  ],
  providers: [DonorsService],
  exports: [DonorsService, MongooseModule],
})
export class DonorsModule {}
