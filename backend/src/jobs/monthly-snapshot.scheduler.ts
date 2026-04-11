import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getBoolean } from '../common/config/runtime-config';
import { MonthlySnapshotService } from './monthly-snapshot.service';

@Injectable()
export class MonthlySnapshotScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MonthlySnapshotScheduler.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly monthlySnapshotService: MonthlySnapshotService,
  ) {}

  onModuleInit(): void {
    const enabled = getBoolean(this.config, 'MONTHLY_SNAPSHOT_SCHEDULER_ENABLED', true);
    if (!enabled) {
      this.logger.log('Monthly snapshot scheduler disabled by MONTHLY_SNAPSHOT_SCHEDULER_ENABLED');
      return;
    }

    this.scheduleNextRun(new Date());
  }

  onModuleDestroy(): void {
    this.clearTimer();
  }

  private scheduleNextRun(from: Date): void {
    this.clearTimer();

    const nextRun = this.monthlySnapshotService.nextRunDateUtc(from);
    const delayMs = Math.max(1000, nextRun.getTime() - Date.now());
    this.logger.log(`Monthly snapshot scheduler armed for ${nextRun.toISOString()}`);

    this.timer = setTimeout(() => {
      void this.executeRun(nextRun);
    }, delayMs);

    this.timer.unref?.();
  }

  private async executeRun(scheduledAtUtc: Date): Promise<void> {
    const monthKey = scheduledAtUtc.toISOString().slice(0, 7);
    this.logger.log(`Monthly snapshot scheduler running month=${monthKey}`);

    try {
      const result = await this.monthlySnapshotService.runForMonth(monthKey);
      this.logger.log(
        `Monthly snapshot scheduler completed month=${monthKey} scanned=${result.total_donors_scanned} success=${result.successful_writes} failed=${result.failed_donors} durationMs=${result.duration_ms}`,
      );
    } catch (error) {
      this.logger.error(
        `Monthly snapshot scheduler failed month=${monthKey}`,
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.scheduleNextRun(new Date(scheduledAtUtc.getTime() + 1000));
    }
  }

  private clearTimer(): void {
    if (!this.timer) {
      return;
    }

    clearTimeout(this.timer);
    this.timer = null;
  }
}
