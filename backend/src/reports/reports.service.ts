import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DonorsService } from '../donors/donors.service';
import { Payment } from '../payments/entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { monthBounds } from '../utils/calculate-dues';
import { MonthlyReport } from './monthly-report.type';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly donorsService: DonorsService,
  ) {}

  async monthlyReport(month: string): Promise<MonthlyReport> {
    const { start, end } = monthBounds(month);

    const totalResult = await this.paymentRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'collected')
      .where('p.payment_date >= :start AND p.payment_date <= :end', { start, end })
      .getRawOne<{ collected: string | null }>();

    const byCollectorRows = await this.paymentRepo
      .createQueryBuilder('p')
      .select('p.collector_id', 'collector_id')
      .addSelect('SUM(p.amount)', 'total')
      .where('p.payment_date >= :start AND p.payment_date <= :end', { start, end })
      .groupBy('p.collector_id')
      .getRawMany<{ collector_id: string; total: string }>();

    const collectorIds = byCollectorRows
      .map((r) => Number(r.collector_id))
      .filter((id) => id > 0);

    const users =
      collectorIds.length > 0
        ? await this.userRepo
            .createQueryBuilder('u')
            .where('u.id IN (:...ids)', { ids: collectorIds })
            .getMany()
        : [];

    const names = new Map(users.map((u) => [u.id, u.name]));
    const totalBalance = Number((await this.donorsService.totalBalance(end)).toFixed(2));
    const collected = Number((Number(totalResult?.collected || 0)).toFixed(2));

    return {
      collected,
      totalBalance,
      byCollector: byCollectorRows.map((row) => ({
        name: names.get(Number(row.collector_id)) || 'Unknown',
        total: Number((Number(row.total || 0)).toFixed(2)),
      })),
    };
  }
}
