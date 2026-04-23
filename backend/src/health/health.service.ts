import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MonthlySnapshotScheduler } from '../jobs/monthly-snapshot.scheduler';
import { LivenessResponse, ReadinessResponse } from './health.types';

const SERVICE_NAME = 'masik-backend';

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly monthlySnapshotScheduler: MonthlySnapshotScheduler,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  live(): LivenessResponse {
    return {
      status: 'ok',
      service: SERVICE_NAME,
      time: new Date().toISOString(),
    };
  }

  async ready(): Promise<ReadinessResponse> {
    const dbStartedAt = Date.now();
    const dbReady = await this.isDatabaseReady();
    const dbLatencyMs = Date.now() - dbStartedAt;

    const configReady = this.hasRequiredConfig();
    const cronReady = this.monthlySnapshotScheduler.isRegistrationHealthy();

    return {
      status: dbReady && configReady && cronReady ? 'ready' : 'not_ready',
      service: SERVICE_NAME,
      checks: {
        db: {
          status: dbReady ? 'ok' : 'fail',
          latencyMs: dbLatencyMs,
        },
        config: {
          status: configReady ? 'ok' : 'fail',
        },
        cron: {
          status: cronReady ? 'ok' : 'fail',
        },
      },
      time: new Date().toISOString(),
    };
  }

  private hasRequiredConfig(): boolean {
    const dbUrl = this.configService.get<string>('DATABASE_URL');
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    return Boolean(dbUrl?.trim() && jwtSecret?.trim());
  }

  private async isDatabaseReady(): Promise<boolean> {
    if (!this.dataSource.isInitialized) {
      return false;
    }

    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
