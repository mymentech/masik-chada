import { describe, expect, it, vi } from 'vitest';
import { MonthlySnapshotScheduler } from './monthly-snapshot.scheduler';

describe('MonthlySnapshotScheduler', () => {
  it('does not arm timer when disabled by env', () => {
    const config = {
      get: vi.fn().mockReturnValue('false'),
    };
    const monthlySnapshotService = {
      nextRunDateUtc: vi.fn(),
      runForMonth: vi.fn(),
    };

    const scheduler = new MonthlySnapshotScheduler(config as never, monthlySnapshotService as never);
    scheduler.onModuleInit();

    expect(monthlySnapshotService.nextRunDateUtc).not.toHaveBeenCalled();
  });

  it('runs scheduled month and re-arms next timer when enabled', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-11T00:00:00.000Z'));

    const firstRun = new Date('2026-05-01T00:01:00.000Z');
    const secondRun = new Date('2026-06-01T00:01:00.000Z');

    const config = {
      get: vi.fn().mockReturnValue(undefined),
    };
    const monthlySnapshotService = {
      nextRunDateUtc: vi.fn().mockReturnValueOnce(firstRun).mockReturnValueOnce(secondRun),
      runForMonth: vi.fn().mockResolvedValue({
        month_key: '2026-05',
        total_donors_scanned: 0,
        successful_writes: 0,
        failed_donors: 0,
        failed_donor_ids: [],
        duration_ms: 0,
      }),
    };

    const scheduler = new MonthlySnapshotScheduler(config as never, monthlySnapshotService as never);
    scheduler.onModuleInit();

    const delay = firstRun.getTime() - Date.now();
    await vi.advanceTimersByTimeAsync(delay);

    expect(monthlySnapshotService.runForMonth).toHaveBeenCalledWith('2026-05');
    expect(monthlySnapshotService.nextRunDateUtc).toHaveBeenCalledTimes(2);

    scheduler.onModuleDestroy();
    vi.useRealTimers();
  });
});
