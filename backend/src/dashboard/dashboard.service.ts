import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { monthBounds } from '../utils/calculate-dues';
import { DonorsService } from '../donors/donors.service';
import { DashboardSummary } from './dashboard.type';

@Injectable()
export class DashboardService {
  constructor(
    private readonly donorsService: DonorsService,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  async summary(): Promise<DashboardSummary> {
    const totalDonors = (await this.donorsService.donorsSummary()).length;
    const totalBalance = Number((await this.donorsService.totalBalance()).toFixed(2));

    const { start, end } = monthBounds();
    const monthRows = await this.paymentModel
      .aggregate<{ total: number; collectors: string[] }>([
        {
          $match: {
            payment_date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            collectors: { $addToSet: '$collector_id' },
          },
        },
      ])
      .exec();

    const thisMonthCollected = Number((monthRows[0]?.total || 0).toFixed(2));
    const totalCollectors = monthRows[0]?.collectors?.length || 0;

    return {
      totalDonors,
      thisMonthCollected,
      totalBalance,
      totalCollectors,
    };
  }
}
