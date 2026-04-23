import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donor } from './entities/donor.entity';
import { Payment } from '../payments/entities/payment.entity';
import { DonorsService } from './donors.service';

@Module({
  imports: [TypeOrmModule.forFeature([Donor, Payment])],
  providers: [DonorsService],
  exports: [DonorsService],
})
export class DonorsModule {}
