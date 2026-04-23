import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { calculateOutstandingBalance, calculateTotalDue, monthBounds, toIsoDate } from '../utils/calculate-dues';
import { DonorInput } from './dto/donor.input';
import { DonorBalance, DonorsPage, DonorsSummaryRow } from './dto/donor-balance.type';
import { Donor } from './entities/donor.entity';

@Injectable()
export class DonorsService {
  constructor(
    @InjectRepository(Donor) private readonly donorRepo: Repository<Donor>,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    private readonly dataSource: DataSource,
  ) {}

  async donors(search?: string, address?: string): Promise<DonorBalance[]> {
    const qb = this.buildDonorsQuery(search, address);
    const donors = await qb.getMany();
    const paidMap = await this.paymentTotalsByDonor();

    return donors.map((donor) => this.toDonorBalance(donor, paidMap));
  }

  async donorsPage(
    search?: string,
    address?: string,
    offset = 0,
    limit = 40,
  ): Promise<DonorsPage> {
    const safeOffset = Number.isFinite(offset) && offset > 0 ? Math.floor(offset) : 0;
    const safeLimit = Number.isFinite(limit)
      ? Math.max(1, Math.min(100, Math.floor(limit)))
      : 40;

    const baseQb = this.buildDonorsQuery(search, address);
    const total = await baseQb.getCount();

    const donors = await baseQb.clone().skip(safeOffset).take(safeLimit).getMany();
    const donorIds = donors.map((d) => Number(d.id));
    const paidMap = await this.paymentTotalsByDonorIds(donorIds);
    const items = donors.map((donor) => this.toDonorBalance(donor, paidMap));

    return {
      items,
      total,
      offset: safeOffset,
      limit: safeLimit,
      hasMore: safeOffset + items.length < total,
    };
  }

  async donor(id: string): Promise<DonorBalance> {
    const donor = await this.donorRepo.findOne({ where: { id: Number(id) } });
    if (!donor) {
      throw new NotFoundException('Donor not found');
    }

    const paidMap = await this.paymentTotalsByDonor(Number(id));
    return this.toDonorBalance(donor, paidMap);
  }

  async addresses(): Promise<string[]> {
    const rows = await this.donorRepo
      .createQueryBuilder('d')
      .select('DISTINCT d.address', 'address')
      .orderBy('d.address', 'ASC')
      .getRawMany<{ address: string }>();
    return rows.map((r) => r.address);
  }

  async createDonor(input: DonorInput): Promise<DonorBalance> {
    const serial_number = await this.nextSerialNumber();
    const donor = await this.donorRepo.save(
      this.donorRepo.create({
        serial_number,
        name: input.name.trim(),
        phone: input.phone?.trim() || '+880',
        address: input.address.trim(),
        monthly_amount: input.monthly_amount,
        registration_date: this.mustDate(input.registration_date, 'registration_date'),
        due_from: input.due_from ? this.mustDate(input.due_from, 'due_from') : null,
      }),
    );

    return this.toDonorBalance(donor, new Map());
  }

  async updateDonor(id: string, input: DonorInput): Promise<DonorBalance> {
    const donor = await this.donorRepo.findOne({ where: { id: Number(id) } });
    if (!donor) {
      throw new NotFoundException('Donor not found');
    }

    await this.donorRepo.update(Number(id), {
      name: input.name.trim(),
      phone: input.phone?.trim() || '+880',
      address: input.address.trim(),
      monthly_amount: input.monthly_amount,
      registration_date: this.mustDate(input.registration_date, 'registration_date'),
      due_from: input.due_from ? this.mustDate(input.due_from, 'due_from') : null,
    });

    const updated = await this.donorRepo.findOne({ where: { id: Number(id) } });
    const paidMap = await this.paymentTotalsByDonor(Number(id));
    return this.toDonorBalance(updated!, paidMap);
  }

  async deleteDonor(id: string) {
    const donor = await this.donorRepo.findOne({ where: { id: Number(id) } });
    if (!donor) {
      throw new NotFoundException('Donor not found');
    }

    // Cascade delete handles payments via FK
    await this.donorRepo.delete(Number(id));

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
    const donors = await this.donorRepo.find();
    if (donors.length === 0) {
      return 0;
    }

    const paidMap = await this.paymentTotalsByDonor(undefined, asOf);
    return donors.reduce((acc, donor) => {
      const totalPaid = paidMap.get(Number(donor.id)) || 0;
      const totalDue = calculateTotalDue(donor, asOf || new Date());
      return acc + calculateOutstandingBalance(totalDue, totalPaid);
    }, 0);
  }

  async syncSerialCounterWithCurrentMax(): Promise<number> {
    const result = await this.donorRepo
      .createQueryBuilder('d')
      .select('MAX(d.serial_number)', 'max')
      .getRawOne<{ max: string | null }>();
    const maxSerial = Number(result?.max || 0);

    await this.dataSource.query(
      `SELECT setval('donor_serial_seq', GREATEST($1::bigint, 1))`,
      [maxSerial],
    );

    return maxSerial;
  }

  private async paymentTotalsByDonor(
    donorId?: number,
    asOf?: Date,
  ): Promise<Map<number, number>> {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .select('p.donor_id', 'donor_id')
      .addSelect('SUM(p.amount)', 'total')
      .groupBy('p.donor_id');

    if (donorId !== undefined) {
      qb.where('p.donor_id = :donorId', { donorId });
    }

    if (asOf) {
      qb.andWhere('p.payment_date <= :asOf', { asOf });
    }

    const rows = await qb.getRawMany<{ donor_id: string; total: string }>();
    const map = new Map<number, number>();
    rows.forEach((row) => {
      map.set(Number(row.donor_id), Number(row.total || 0));
    });
    return map;
  }

  private async paymentTotalsByDonorIds(donorIds: number[]): Promise<Map<number, number>> {
    if (donorIds.length === 0) {
      return new Map();
    }

    const rows = await this.paymentRepo
      .createQueryBuilder('p')
      .select('p.donor_id', 'donor_id')
      .addSelect('SUM(p.amount)', 'total')
      .where('p.donor_id IN (:...donorIds)', { donorIds })
      .groupBy('p.donor_id')
      .getRawMany<{ donor_id: string; total: string }>();

    const map = new Map<number, number>();
    rows.forEach((row) => {
      map.set(Number(row.donor_id), Number(row.total || 0));
    });
    return map;
  }

  private buildDonorsQuery(search?: string, address?: string) {
    const qb = this.donorRepo.createQueryBuilder('d').orderBy('d.serial_number', 'ASC');

    if (address) {
      qb.andWhere('d.address = :address', { address });
    }

    if (search) {
      const serial = Number(search);
      if (Number.isInteger(serial) && String(serial) === search.trim()) {
        qb.andWhere('(d.serial_number = :serial OR d.name ILIKE :searchPat)', {
          serial,
          searchPat: `%${search.trim()}%`,
        });
      } else {
        qb.andWhere('d.name ILIKE :searchPat', { searchPat: `%${search.trim()}%` });
      }
    }

    return qb;
  }

  private toDonorBalance(donor: Donor, paidMap: Map<number, number>): DonorBalance {
    const total_paid = Number((paidMap.get(Number(donor.id)) || 0).toFixed(2));
    const total_due = calculateTotalDue(donor);
    const balance = calculateOutstandingBalance(total_due, total_paid);

    return {
      id: String(donor.id),
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
    const result = await this.dataSource.query<[{ seq: string }]>(
      `SELECT nextval('donor_serial_seq') AS seq`,
    );
    return Number(result[0].seq);
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
