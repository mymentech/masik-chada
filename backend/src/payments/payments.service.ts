import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Donor, DonorDocument } from '../donors/schemas/donor.schema';
import { monthBounds } from '../utils/calculate-dues';
import { Payment, PaymentDocument } from './schemas/payment.schema';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Donor.name) private readonly donorModel: Model<DonorDocument>,
  ) {}

  async payments(month?: string): Promise<Payment[]> {
    const filter: Record<string, unknown> = {};
    if (month) {
      const { start, end } = monthBounds(month);
      filter.payment_date = { $gte: start, $lte: end };
    }

    const payments = await this.paymentModel.find(filter).sort({ payment_date: -1 }).exec();
    return payments;
  }

  async donorPayments(donorId: string): Promise<Payment[]> {
    if (!Types.ObjectId.isValid(donorId)) {
      throw new BadRequestException('Invalid donor id');
    }

    return this.paymentModel
      .find({ donor_id: new Types.ObjectId(donorId) })
      .sort({ payment_date: -1 })
      .exec();
  }

  async recordPayment(donorId: string, amount: number, paymentDate: string, collectorId: string): Promise<Payment> {
    if (!Types.ObjectId.isValid(donorId)) {
      throw new BadRequestException('Invalid donor id');
    }

    const donor = await this.donorModel.findById(donorId).lean().exec();
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

    const payment = await this.paymentModel.create({
      donor_id: new Types.ObjectId(donorId),
      collector_id: new Types.ObjectId(collectorId),
      amount,
      payment_date: parsedPaymentDate,
    });

    return payment;
  }

  async monthCollectedTotal(month?: string): Promise<number> {
    const match: Record<string, unknown> = {};

    if (month) {
      const { start, end } = monthBounds(month);
      match.payment_date = { $gte: start, $lte: end };
    }

    const result = await this.paymentModel
      .aggregate<{ total: number }>([
        { $match: match },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ])
      .exec();

    return Number((result[0]?.total || 0).toFixed(2));
  }
}
