import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { monthBounds } from '../utils/calculate-dues';
import { DonorsService } from '../donors/donors.service';
import { DashboardSummary } from './dashboard.type';

@Injectable()
export class DashboardService {
  constructor(
    private readonly donorsService: DonorsService,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
  ) {}

  async summary(): Promise<DashboardSummary> {
    const totalDonors = (await this.donorsService.donorsSummary()).length;
    const totalBalance = Number((await this.donorsService.totalBalance()).toFixed(2));

    const { start, end } = monthBounds();

    const result = await this.paymentRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .addSelect('COUNT(DISTINCT p.collector_id)', 'collectors')
      .where('p.payment_date >= :start AND p.payment_date <= :end', { start, end })
      .getRawOne<{ total: string | null; collectors: string }>();

    const thisMonthCollected = Number((Number(result?.total || 0)).toFixed(2));
    const totalCollectors = Number(result?.collectors || 0);

    return {
      totalDonors,
      thisMonthCollected,
      totalBalance,
      totalCollectors,
    };
  }
}
