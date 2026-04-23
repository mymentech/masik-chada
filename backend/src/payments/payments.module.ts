import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donor } from '../donors/entities/donor.entity';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Donor])],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
