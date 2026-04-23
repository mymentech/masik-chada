import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfMonth, formatISO, startOfMonth } from 'date-fns';
import { Repository } from 'typeorm';
import { Donor } from '../donors/entities/donor.entity';
import { Payment } from '../payments/entities/payment.entity';
import { calculateOutstandingBalance, calculateTotalDue } from '../utils/calculate-dues';
import { MonthlySnapshotJobResult } from './dto/monthly-snapshot-job-result.type';
import { MonthlyDonorSnapshot } from './entities/monthly-donor-snapshot.entity';
import { MonthlyJobRun } from './entities/monthly-job-run.entity';

const MONTHLY_SNAPSHOT_JOB_KEY = 'monthly_donor_snapshot';

function toUtcMonthStart(input: Date): Date {
  return new Date(Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), 1, 0, 0, 0, 0));
}

function toMonthKey(input: Date): string {
  return formatISO(input, { representation: 'date' }).slice(0, 7);
}

@Injectable()
export class MonthlySnapshotService {
  private readonly logger = new Logger(MonthlySnapshotService.name);

  constructor(
    @InjectRepository(Donor) private readonly donorRepo: Repository<Donor>,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(MonthlyDonorSnapshot)
    private readonly snapshotRepo: Repository<MonthlyDonorSnapshot>,
    @InjectRepository(MonthlyJobRun)
    private readonly runRepo: Repository<MonthlyJobRun>,
  ) {}

  async runForMonth(month?: string): Promise<MonthlySnapshotJobResult> {
    const monthStartInput = month ? new Date(`${month}-01T00:00:00.000Z`) : new Date();
    if (Number.isNaN(monthStartInput.getTime())) {
      throw new BadRequestException('Invalid month format. Expected YYYY-MM.');
    }

    const monthStart = toUtcMonthStart(monthStartInput);
    const monthKey = toMonthKey(monthStart);
    const monthEnd = endOfMonth(monthStart);
    const startedAt = new Date();

    const donors = await this.donorRepo.find();

    const paidRows = await this.paymentRepo
      .createQueryBuilder('p')
      .select('p.donor_id', 'donor_id')
      .addSelect('SUM(p.amount)', 'total')
      .where('p.payment_date <= :monthEnd', { monthEnd })
      .groupBy('p.donor_id')
      .getRawMany<{ donor_id: string; total: string }>();

    const paidMap = new Map<number, number>();
    paidRows.forEach((row) => {
      paidMap.set(Number(row.donor_id), Number(row.total || 0));
    });

    const failedDonorIds: string[] = [];
    let successfulWrites = 0;

    for (const donor of donors) {
      try {
        const totalPaid = Number((paidMap.get(Number(donor.id)) || 0).toFixed(2));
        const totalDue = calculateTotalDue(donor, monthEnd);
        const balance = calculateOutstandingBalance(totalDue, totalPaid);

        await this.snapshotRepo
          .createQueryBuilder()
          .insert()
          .into(MonthlyDonorSnapshot)
          .values({
            donor_id: donor.id,
            month_key: monthKey,
            total_due: totalDue,
            total_paid: totalPaid,
            balance,
            computed_at: monthEnd,
          })
          .orUpdate(
            ['total_due', 'total_paid', 'balance', 'computed_at', 'updated_at'],
            ['donor_id', 'month_key'],
          )
          .execute();

        successfulWrites += 1;
      } catch (error) {
        failedDonorIds.push(String(donor.id));
        this.logger.error(
          `Monthly snapshot write failed for donor=${donor.id}, month=${monthKey}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    const finishedAt = new Date();
    const result: MonthlySnapshotJobResult = {
      month_key: monthKey,
      total_donors_scanned: donors.length,
      successful_writes: successfulWrites,
      failed_donors: failedDonorIds.length,
      failed_donor_ids: failedDonorIds,
      duration_ms: finishedAt.getTime() - startedAt.getTime(),
    };

    await this.runRepo
      .createQueryBuilder()
      .insert()
      .into(MonthlyJobRun)
      .values({
        job_key: MONTHLY_SNAPSHOT_JOB_KEY,
        month_key: monthKey,
        total_donors_scanned: result.total_donors_scanned,
        successful_writes: result.successful_writes,
        failed_donors: result.failed_donors,
        failed_donor_ids: result.failed_donor_ids,
        duration_ms: result.duration_ms,
        started_at: startedAt,
        finished_at: finishedAt,
      })
      .orUpdate(
        [
          'total_donors_scanned',
          'successful_writes',
          'failed_donors',
          'failed_donor_ids',
          'duration_ms',
          'started_at',
          'finished_at',
        ],
        ['job_key', 'month_key'],
      )
      .execute();

    this.logger.log(
      `Monthly snapshot completed month=${monthKey} scanned=${result.total_donors_scanned} success=${result.successful_writes} failed=${result.failed_donors}`,
    );

    return result;
  }

  nextRunDateUtc(from = new Date()): Date {
    const now = new Date(from.getTime());
    const monthStart = toUtcMonthStart(now);
    const nextMonth = startOfMonth(
      new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1)),
    );
    return new Date(Date.UTC(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth(), 1, 0, 1, 0, 0));
  }
}
