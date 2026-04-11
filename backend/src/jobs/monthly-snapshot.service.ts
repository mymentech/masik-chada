import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { endOfMonth, formatISO, startOfMonth } from 'date-fns';
import { Model } from 'mongoose';
import { Donor, DonorDocument } from '../donors/schemas/donor.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { calculateOutstandingBalance, calculateTotalDue } from '../utils/calculate-dues';
import { MonthlySnapshotJobResult } from './dto/monthly-snapshot-job-result.type';
import { MonthlyJobRun, MonthlyJobRunDocument } from './schemas/monthly-job-run.schema';
import {
  MonthlyDonorSnapshot,
  MonthlyDonorSnapshotDocument,
} from './schemas/monthly-donor-snapshot.schema';

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
    @InjectModel(Donor.name) private readonly donorModel: Model<DonorDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(MonthlyDonorSnapshot.name)
    private readonly snapshotModel: Model<MonthlyDonorSnapshotDocument>,
    @InjectModel(MonthlyJobRun.name)
    private readonly runModel: Model<MonthlyJobRunDocument>,
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

    const donors = await this.donorModel.find().lean().exec();
    const paidRows = await this.paymentModel
      .aggregate<{ _id: string; total: number }>([
        {
          $match: {
            payment_date: { $lte: monthEnd },
          },
        },
        {
          $group: {
            _id: '$donor_id',
            total: { $sum: '$amount' },
          },
        },
      ])
      .exec();

    const paidMap = new Map<string, number>();
    paidRows.forEach((row) => {
      paidMap.set(String(row._id), Number(row.total || 0));
    });

    const failedDonorIds: string[] = [];
    let successfulWrites = 0;

    for (const donor of donors) {
      const donorId = String(donor._id);

      try {
        const totalPaid = Number((paidMap.get(donorId) || 0).toFixed(2));
        const totalDue = calculateTotalDue(donor, monthEnd);
        const balance = calculateOutstandingBalance(totalDue, totalPaid);

        await this.snapshotModel
          .updateOne(
            { donor_id: donor._id, month_key: monthKey },
            {
              $set: {
                total_due: totalDue,
                total_paid: totalPaid,
                balance,
                computed_at: monthEnd,
              },
              $setOnInsert: {
                donor_id: donor._id,
                month_key: monthKey,
              },
            },
            { upsert: true },
          )
          .exec();

        successfulWrites += 1;
      } catch (error) {
        failedDonorIds.push(donorId);
        this.logger.error(
          `Monthly snapshot write failed for donor=${donorId}, month=${monthKey}`,
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

    await this.runModel
      .updateOne(
        { job_key: MONTHLY_SNAPSHOT_JOB_KEY, month_key: monthKey },
        {
          $set: {
            total_donors_scanned: result.total_donors_scanned,
            successful_writes: result.successful_writes,
            failed_donors: result.failed_donors,
            failed_donor_ids: result.failed_donor_ids,
            duration_ms: result.duration_ms,
            started_at: startedAt,
            finished_at: finishedAt,
          },
          $setOnInsert: {
            job_key: MONTHLY_SNAPSHOT_JOB_KEY,
            month_key: monthKey,
          },
        },
        { upsert: true },
      )
      .exec();

    this.logger.log(
      `Monthly snapshot completed month=${monthKey} scanned=${result.total_donors_scanned} success=${result.successful_writes} failed=${result.failed_donors}`,
    );

    return result;
  }

  nextRunDateUtc(from = new Date()): Date {
    const now = new Date(from.getTime());
    const monthStart = toUtcMonthStart(now);
    const nextMonth = startOfMonth(new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1)));
    return new Date(Date.UTC(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth(), 1, 0, 1, 0, 0));
  }
}
