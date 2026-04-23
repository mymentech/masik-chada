import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donor } from '../donors/entities/donor.entity';
import { monthBounds } from '../utils/calculate-dues';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Donor) private readonly donorRepo: Repository<Donor>,
  ) {}

  async payments(month?: string): Promise<Payment[]> {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .orderBy('p.payment_date', 'DESC');

    if (month) {
      const { start, end } = monthBounds(month);
      qb.where('p.payment_date >= :start AND p.payment_date <= :end', { start, end });
    }

    return qb.getMany();
  }

  async donorPayments(donorId: string): Promise<Payment[]> {
    const id = Number(donorId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('Invalid donor id');
    }

    return this.paymentRepo
      .createQueryBuilder('p')
      .where('p.donor_id = :donorId', { donorId: id })
      .orderBy('p.payment_date', 'DESC')
      .getMany();
  }

  async recordPayment(
    donorId: string,
    amount: number,
    paymentDate: string,
    collectorId: string,
  ): Promise<Payment> {
    const id = Number(donorId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('Invalid donor id');
    }

    const donor = await this.donorRepo.findOne({ where: { id } });
    if (!donor) {
      throw new NotFoundException('Donor not found');
    }

    if (!(amount > 0)) {
      throw new BadRequestException('amount must be greater than 0');
    }

    const parsedPaymentDate = new Date(paymentDate);
    if (Number.isNaN(parsedPaymentDate.getTime())) {
      throw new BadRequestException('paymentDate must be a valid date string');
    }

    const payment = this.paymentRepo.create({
      donor_id: id,
      collector_id: Number(collectorId),
      amount,
      payment_date: parsedPaymentDate,
    });

    return this.paymentRepo.save(payment);
  }

  async monthCollectedTotal(month?: string): Promise<number> {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total');

    if (month) {
      const { start, end } = monthBounds(month);
      qb.where('p.payment_date >= :start AND p.payment_date <= :end', { start, end });
    }

    const result = await qb.getRawOne<{ total: string | null }>();
    return Number((Number(result?.total || 0)).toFixed(2));
  }
}
