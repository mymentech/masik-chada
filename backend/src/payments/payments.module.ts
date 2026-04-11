import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Donor, DonorSchema } from '../donors/schemas/donor.schema';
import { PaymentsService } from './payments.service';
import { Payment, PaymentSchema } from './schemas/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Donor.name, schema: DonorSchema },
    ]),
  ],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
