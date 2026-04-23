import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donor } from '../donors/entities/donor.entity';
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
    @InjectRepository(Donor) private readonly donorRepo: Repository<Donor>,
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

    const names = new Map(users.map((u) => [Number(u.id), u.name]));
    const totalBalance = Number((await this.donorsService.totalBalance(end)).toFixed(2));
    const collected = Number((Number(totalResult?.collected || 0)).toFixed(2));

    const paymentRows = await this.paymentRepo
      .createQueryBuilder('p')
      .where('p.payment_date >= :start AND p.payment_date <= :end', { start, end })
      .orderBy('p.payment_date', 'DESC')
      .addOrderBy('p.id', 'DESC')
      .getMany();

    const donorIds = Array.from(new Set(paymentRows.map((p) => Number(p.donor_id))));
    const donors = donorIds.length > 0
      ? await this.donorRepo
          .createQueryBuilder('d')
          .where('d.id IN (:...ids)', { ids: donorIds })
          .getMany()
      : [];
    const donorMap = new Map(donors.map((d) => [Number(d.id), d]));

    return {
      collected,
      totalBalance,
      byCollector: byCollectorRows.map((row) => ({
        name: names.get(Number(row.collector_id)) || 'Unknown',
        total: Number((Number(row.total || 0)).toFixed(2)),
      })),
      payments: paymentRows.map((p) => {
        const donor = donorMap.get(Number(p.donor_id));
        return {
          id: String(p.id),
          donor_serial: donor?.serial_number ?? 0,
          donor_name: donor?.name ?? 'Unknown',
          donor_address: donor?.address ?? '',
          amount: Number(Number(p.amount).toFixed(2)),
          payment_date: p.payment_date,
          collector_name: names.get(Number(p.collector_id)) || 'Unknown',
        };
      }),
    };
  }
}
