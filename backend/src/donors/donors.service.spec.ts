import { describe, expect, it, vi } from 'vitest';

vi.mock('../counters/schemas/counter.schema', () => ({
  Counter: class Counter {},
}));

vi.mock('../payments/schemas/payment.schema', () => ({
  Payment: class Payment {},
}));

vi.mock('./schemas/donor.schema', () => ({
  Donor: class Donor {},
}));

describe('DonorsService.nextSerialNumber', () => {
  it('bootstraps counter to donor max before incrementing', async () => {
    const { DonorsService } = await import('./donors.service');

    const maxDonorExec = vi.fn().mockResolvedValue({ serial_number: 100 });
    const donorModel = {
      findOne: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            lean: vi.fn().mockReturnValue({
              exec: maxDonorExec,
            }),
          }),
        }),
      }),
    };

    const initExec = vi.fn().mockResolvedValue({ key: 'donor_serial', value: 100 });
    const incExec = vi.fn().mockResolvedValue({ key: 'donor_serial', value: 101 });
    const counterFindOneAndUpdate = vi
      .fn()
      .mockReturnValueOnce({
        lean: vi.fn().mockReturnValue({
          exec: initExec,
        }),
      })
      .mockReturnValueOnce({
        lean: vi.fn().mockReturnValue({
          exec: incExec,
        }),
      });
    const counterModel = {
      findOneAndUpdate: counterFindOneAndUpdate,
    };

    const service = new DonorsService(donorModel as never, {} as never, counterModel as never);
    const serial = await (service as any).nextSerialNumber();

    expect(serial).toBe(101);
    expect(counterFindOneAndUpdate).toHaveBeenNthCalledWith(
      1,
      { key: 'donor_serial' },
      {
        $max: { value: 100 },
        $setOnInsert: { key: 'donor_serial' },
      },
      { upsert: true, new: true },
    );
    expect(counterFindOneAndUpdate).toHaveBeenNthCalledWith(
      2,
      { key: 'donor_serial' },
      { $inc: { value: 1 } },
      { new: true },
    );
  });

  it('does not rewind when counter is already ahead of donor max', async () => {
    const { DonorsService } = await import('./donors.service');

    const maxDonorExec = vi.fn().mockResolvedValue({ serial_number: 80 });
    const donorModel = {
      findOne: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            lean: vi.fn().mockReturnValue({
              exec: maxDonorExec,
            }),
          }),
        }),
      }),
    };

    const initExec = vi.fn().mockResolvedValue({ key: 'donor_serial', value: 120 });
    const incExec = vi.fn().mockResolvedValue({ key: 'donor_serial', value: 121 });
    const counterFindOneAndUpdate = vi
      .fn()
      .mockReturnValueOnce({
        lean: vi.fn().mockReturnValue({
          exec: initExec,
        }),
      })
      .mockReturnValueOnce({
        lean: vi.fn().mockReturnValue({
          exec: incExec,
        }),
      });
    const counterModel = {
      findOneAndUpdate: counterFindOneAndUpdate,
    };

    const service = new DonorsService(donorModel as never, {} as never, counterModel as never);
    const serial = await (service as any).nextSerialNumber();

    expect(serial).toBe(121);
    expect(counterFindOneAndUpdate).toHaveBeenNthCalledWith(
      1,
      { key: 'donor_serial' },
      {
        $max: { value: 80 },
        $setOnInsert: { key: 'donor_serial' },
      },
      { upsert: true, new: true },
    );
  });
});
