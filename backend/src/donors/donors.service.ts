import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, type PipelineStage } from 'mongoose';
import { Counter, CounterDocument } from '../counters/schemas/counter.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { calculateOutstandingBalance, calculateTotalDue, monthBounds, toIsoDate } from '../utils/calculate-dues';
import { DonorInput } from './dto/donor.input';
import { DonorBalance, DonorsSummaryRow } from './dto/donor-balance.type';
import { Donor, DonorDocument } from './schemas/donor.schema';

@Injectable()
export class DonorsService {
  constructor(
    @InjectModel(Donor.name) private readonly donorModel: Model<DonorDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Counter.name) private readonly counterModel: Model<CounterDocument>,
  ) {}

  async donors(search?: string, address?: string): Promise<DonorBalance[]> {
    const filter: FilterQuery<DonorDocument> = {};

    if (address) {
      filter.address = address;
    }

    if (search) {
      const serial = Number(search);
      if (Number.isInteger(serial) && String(serial) === search.trim()) {
        filter.$or = [{ serial_number: serial }, { name: { $regex: search.trim(), $options: 'i' } }];
      } else {
        filter.name = { $regex: search.trim(), $options: 'i' };
      }
    }

    const donors = await this.donorModel.find(filter).sort({ serial_number: 1 }).lean().exec();
    const paidMap = await this.paymentTotalsByDonor();

    return donors.map((donor) => this.toDonorBalance(donor, paidMap));
  }

  async donor(id: string): Promise<DonorBalance> {
    const donor = await this.donorModel.findById(id).lean().exec();
    if (!donor) {
      throw new NotFoundException('Donor not found');
    }

    const paidMap = await this.paymentTotalsByDonor(new Types.ObjectId(id));
    return this.toDonorBalance(donor, paidMap);
  }

  async addresses(): Promise<string[]> {
    return this.donorModel.distinct('address').exec();
  }

  async createDonor(input: DonorInput): Promise<DonorBalance> {
    const serial_number = await this.nextSerialNumber();
    const donor = await this.donorModel.create({
      serial_number,
      name: input.name.trim(),
      phone: input.phone?.trim() || '+880',
      address: input.address.trim(),
      monthly_amount: input.monthly_amount,
      registration_date: this.mustDate(input.registration_date, 'registration_date'),
      due_from: input.due_from ? this.mustDate(input.due_from, 'due_from') : null,
    });

    return this.toDonorBalance(donor.toObject(), new Map());
  }

  async updateDonor(id: string, input: DonorInput): Promise<DonorBalance> {
    const donor = await this.donorModel
      .findByIdAndUpdate(
        id,
        {
          name: input.name.trim(),
          phone: input.phone?.trim() || '+880',
          address: input.address.trim(),
          monthly_amount: input.monthly_amount,
          registration_date: this.mustDate(input.registration_date, 'registration_date'),
          due_from: input.due_from ? this.mustDate(input.due_from, 'due_from') : null,
        },
        { new: true },
      )
      .lean()
      .exec();

    if (!donor) {
      throw new NotFoundException('Donor not found');
    }

    const paidMap = await this.paymentTotalsByDonor(new Types.ObjectId(id));
    return this.toDonorBalance(donor, paidMap);
  }

  async deleteDonor(id: string) {
    const donor = await this.donorModel.findById(id).exec();
    if (!donor) {
      throw new NotFoundException('Donor not found');
    }

    await this.paymentModel.deleteMany({ donor_id: donor._id }).exec();
    await donor.deleteOne();

    return {
      success: true,
      message: 'Donor and related payments deleted successfully',
    };
  }

  async donorsSummary(): Promise<DonorsSummaryRow[]> {
    const rows = await this.donors();
    return rows.map((donor) => ({
      id: donor.id,
      serial_number: donor.serial_number,
      name: donor.name,
      address: donor.address,
      monthly_amount: donor.monthly_amount,
      balance: donor.balance,
    }));
  }

  async totalBalance(asOf?: Date): Promise<number> {
    const donors = await this.donorModel.find().lean().exec();
    if (donors.length === 0) {
      return 0;
    }

    const paidMap = await this.paymentTotalsByDonor(undefined, asOf);
    return donors.reduce((acc, donor) => {
      const donorId = String(donor._id);
      const totalPaid = paidMap.get(donorId) || 0;
      const totalDue = calculateTotalDue(donor, asOf || new Date());
      return acc + calculateOutstandingBalance(totalDue, totalPaid);
    }, 0);
  }

  async syncSerialCounterWithCurrentMax(): Promise<number> {
    const max = await this.donorModel
      .findOne()
      .sort({ serial_number: -1 })
      .select({ serial_number: 1 })
      .lean()
      .exec();

    const maxSerial = Number(max?.serial_number || 0);

    await this.counterModel
      .updateOne(
        { key: 'donor_serial' },
        {
          $set: { value: maxSerial },
          $setOnInsert: { key: 'donor_serial' },
        },
        { upsert: true },
      )
      .exec();

    return maxSerial;
  }

  private async paymentTotalsByDonor(
    donorId?: Types.ObjectId,
    asOf?: Date,
  ): Promise<Map<string, number>> {
    const match: Record<string, unknown> = {};
    if (donorId) {
      match.donor_id = donorId;
    }

    if (asOf) {
      match.payment_date = { $lte: asOf };
    }

    const pipeline: PipelineStage[] = [];
    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    pipeline.push({
      $group: {
        _id: '$donor_id',
        total: { $sum: '$amount' },
      },
    });

    const rows = await this.paymentModel.aggregate<{ _id: Types.ObjectId; total: number }>(pipeline).exec();
    const map = new Map<string, number>();

    rows.forEach((row) => {
      map.set(String(row._id), Number(row.total || 0));
    });

    return map;
  }

  private toDonorBalance(donor: Donor & { _id?: Types.ObjectId }, paidMap: Map<string, number>): DonorBalance {
    const donorId = String(donor._id || donor.id);
    const total_paid = Number((paidMap.get(donorId) || 0).toFixed(2));
    const total_due = calculateTotalDue(donor);
    const balance = calculateOutstandingBalance(total_due, total_paid);

    return {
      id: donorId,
      serial_number: donor.serial_number,
      name: donor.name,
      phone: donor.phone,
      address: donor.address,
      monthly_amount: donor.monthly_amount,
      registration_date: toIsoDate(donor.registration_date) || '',
      due_from: toIsoDate(donor.due_from) || undefined,
      total_due,
      total_paid,
      balance,
      created_at: toIsoDate(donor.created_at),
      updated_at: toIsoDate(donor.updated_at),
    };
  }

  private async nextSerialNumber(): Promise<number> {
    const max = await this.donorModel.findOne().sort({ serial_number: -1 }).select({ serial_number: 1 }).lean().exec();
    const maxSerial = Number(max?.serial_number || 0);

    await this.counterModel
      .findOneAndUpdate(
        { key: 'donor_serial' },
        {
          $max: { value: maxSerial },
          $setOnInsert: { key: 'donor_serial' },
        },
        { upsert: true, new: true },
      )
      .lean()
      .exec();

    const counter = await this.counterModel
      .findOneAndUpdate({ key: 'donor_serial' }, { $inc: { value: 1 } }, { new: true })
      .lean()
      .exec();

    if (!counter) {
      throw new Error('Unable to allocate donor serial number');
    }

    return counter.value;
  }

  private mustDate(value: string, fieldName: string): Date {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`${fieldName} must be a valid date string`);
    }

    return parsed;
  }

  monthEnd(month: string) {
    return monthBounds(month).end;
  }
}
