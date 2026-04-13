import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MonthlySnapshotScheduler } from '../jobs/monthly-snapshot.scheduler';
import { getBoolean } from '../common/config/runtime-config';
import { LivenessResponse, ReadinessResponse } from './health.types';

const SERVICE_NAME = 'masik-backend';

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly monthlySnapshotScheduler: MonthlySnapshotScheduler,
    @InjectConnection() private readonly connection: Connection,
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
    const mongoUri = this.configService.get<string>('MONGO_URI');
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    return Boolean(mongoUri?.trim() && jwtSecret?.trim());
  }

  private async isDatabaseReady(): Promise<boolean> {
    if (this.connection.readyState !== 1) {
      return false;
    }

    try {
      await this.connection.db?.admin().ping();
      return true;
    } catch {
      return false;
    }
  }
}
