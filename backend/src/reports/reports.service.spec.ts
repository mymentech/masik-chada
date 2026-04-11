import { describe, expect, it, vi } from 'vitest';

vi.mock('../payments/schemas/payment.schema', () => ({
  Payment: class Payment {},
}));

vi.mock('../users/schemas/user.schema', () => ({
  User: class User {},
}));

describe('ReportsService.monthlyReport', () => {
  it('maps facet totals and collector ids correctly', async () => {
    const { ReportsService } = await import('./reports.service');

    const aggregateExec = vi.fn().mockResolvedValue([
      {
        totals: [{ collected: 351.237 }],
        byCollector: [
          { _id: 'u1', total: 200.115 },
          { _id: 'u2', total: 151.122 },
        ],
      },
    ]);
    const paymentModel = {
      aggregate: vi.fn().mockReturnValue({
        exec: aggregateExec,
      }),
    };

    const userFindExec = vi.fn().mockResolvedValue([{ _id: 'u1', name: 'Collector One' }]);
    const userModel = {
      find: vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: userFindExec,
        }),
      }),
    };

    const donorsService = {
      totalBalance: vi.fn().mockResolvedValue(899.994),
    };

    const service = new ReportsService(paymentModel as never, userModel as never, donorsService as never);

    const report = await service.monthlyReport('2026-04');

    expect(paymentModel.aggregate).toHaveBeenCalledTimes(1);
    expect(userModel.find).toHaveBeenCalledWith({ _id: { $in: ['u1', 'u2'] } });
    expect(donorsService.totalBalance).toHaveBeenCalledTimes(1);
    expect(report).toEqual({
      collected: 351.24,
      totalBalance: 899.99,
      byCollector: [
        { name: 'Collector One', total: 200.12 },
        { name: 'Unknown', total: 151.12 },
      ],
    });
  });
});
