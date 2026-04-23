import { describe, expect, it, vi } from 'vitest';

describe('DonorsService.nextSerialNumber', () => {
  it('returns the next sequence value from the database', async () => {
    const { DonorsService } = await import('./donors.service');

    const dataSource = {
      query: vi.fn().mockResolvedValue([{ seq: '101' }]),
    };

    const service = new DonorsService(
      {} as never,
      {} as never,
      dataSource as never,
    );

    const serial = await (service as any).nextSerialNumber();

    expect(serial).toBe(101);
    expect(dataSource.query).toHaveBeenCalledWith(
      `SELECT nextval('donor_serial_seq') AS seq`,
    );
  });

  it('converts the returned string seq value to a number', async () => {
    const { DonorsService } = await import('./donors.service');

    const dataSource = {
      query: vi.fn().mockResolvedValue([{ seq: '42' }]),
    };

    const service = new DonorsService(
      {} as never,
      {} as never,
      dataSource as never,
    );

    const serial = await (service as any).nextSerialNumber();
    expect(serial).toBe(42);
    expect(typeof serial).toBe('number');
  });
});
