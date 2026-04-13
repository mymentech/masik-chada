import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DonorsService } from '../donors/donors.service';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { monthBounds } from '../utils/calculate-dues';
import { MonthlyReport } from './monthly-report.type';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly donorsService: DonorsService,
  ) {}

  async monthlyReport(month: string): Promise<MonthlyReport> {
    const { start, end } = monthBounds(month);

    const paymentRows = await this.paymentModel
      .aggregate<{
        totals: { collected: number }[];
        byCollector: { _id: Types.ObjectId | string | null; total: number }[];
      }>([
        { $match: { payment_date: { $gte: start, $lte: end } } },
        {
          $facet: {
            totals: [{ $group: { _id: null, collected: { $sum: '$amount' } } }],
            byCollector: [{ $group: { _id: '$collector_id', total: { $sum: '$amount' } } }],
          },
        },
      ])
      .exec();

    const byCollectorRows = paymentRows[0]?.byCollector || [];
    const collectorIds = byCollectorRows
      .map((row) => row._id)
      .filter((collectorId): collectorId is Types.ObjectId | string => collectorId !== null);
    const users =
      collectorIds.length > 0
        ? await this.userModel.find({ _id: { $in: collectorIds } }).lean().exec()
        : [];
    const names = new Map(users.map((user) => [String(user._id), user.name]));

    const totalBalance = Number((await this.donorsService.totalBalance(end)).toFixed(2));
    const collected = Number((paymentRows[0]?.totals?.[0]?.collected || 0).toFixed(2));

    return {
      collected,
      totalBalance,
      byCollector: byCollectorRows.map((row) => ({
        name: names.get(String(row._id)) || 'Unknown',
        total: Number((row.total || 0).toFixed(2)),
      })),
    };
  }
}
