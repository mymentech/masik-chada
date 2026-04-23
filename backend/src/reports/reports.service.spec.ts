import { describe, expect, it, vi } from 'vitest';

describe('ReportsService.monthlyReport', () => {
  it('maps totals and collector ids correctly', async () => {
    const { ReportsService } = await import('./reports.service');

    let paymentQbCallCount = 0;
    const paymentRepo = {
      createQueryBuilder: vi.fn().mockImplementation(() => {
        paymentQbCallCount++;
        if (paymentQbCallCount === 1) {
          // totalResult call
          return {
            select: vi.fn().mockReturnThis(),
            addSelect: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            getRawOne: vi.fn().mockResolvedValue({ collected: '351.237' }),
          };
        }
        if (paymentQbCallCount === 2) {
          // byCollector call
          return {
            select: vi.fn().mockReturnThis(),
            addSelect: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockReturnThis(),
            getRawMany: vi.fn().mockResolvedValue([
              { collector_id: '1', total: '200.115' },
              { collector_id: '2', total: '151.122' },
            ]),
          };
        }
        // payment rows call
        return {
          where: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockReturnThis(),
          addOrderBy: vi.fn().mockReturnThis(),
          getMany: vi.fn().mockResolvedValue([]),
        };
      }),
    };

    const userRepo = {
      createQueryBuilder: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([{ id: 1, name: 'Collector One' }]),
      }),
    };

    const donorsService = {
      totalBalance: vi.fn().mockResolvedValue(899.994),
    };
    const donorRepo = { createQueryBuilder: vi.fn() };

    const service = new ReportsService(
      paymentRepo as never,
      userRepo as never,
      donorRepo as never,
      donorsService as never,
    );

    const report = await service.monthlyReport('2026-04');

    expect(donorsService.totalBalance).toHaveBeenCalledTimes(1);
    expect(report.collected).toBe(351.24);
    expect(report.totalBalance).toBe(899.99);
    expect(report.byCollector).toHaveLength(2);
    expect(report.byCollector[0].name).toBe('Collector One');
    expect(report.byCollector[1].name).toBe('Unknown');
    expect(report.payments).toEqual([]);
  });

  it('returns zero totals and skips collector lookup when no payments exist', async () => {
    const { ReportsService } = await import('./reports.service');

    let callCount = 0;
    const paymentRepo = { createQueryBuilder: vi.fn() };

    const paymentRowsRepo = {
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      addOrderBy: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValue([]),
    };

    paymentRepo.createQueryBuilder = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          addSelect: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          getRawOne: vi.fn().mockResolvedValue({ collected: null }),
        };
      }
      if (callCount === 2) {
        return {
          select: vi.fn().mockReturnThis(),
          addSelect: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          groupBy: vi.fn().mockReturnThis(),
          getRawMany: vi.fn().mockResolvedValue([]),
        };
      }
      return paymentRowsRepo;
    });

    const userRepo = { createQueryBuilder: vi.fn() };
    const donorsService = { totalBalance: vi.fn().mockResolvedValue(0) };
    const donorRepo = { createQueryBuilder: vi.fn() };

    const service = new ReportsService(
      paymentRepo as never,
      userRepo as never,
      donorRepo as never,
      donorsService as never,
    );

    const report = await service.monthlyReport('2026-04');

    expect(userRepo.createQueryBuilder).not.toHaveBeenCalled();
    expect(donorRepo.createQueryBuilder).not.toHaveBeenCalled();
    expect(report).toEqual({ collected: 0, totalBalance: 0, byCollector: [], payments: [] });
  });
});
