import { describe, expect, it, vi } from 'vitest';
import { HealthService } from './health.service';

describe('HealthService', () => {
  it('reports ready when db, config, and scheduler are healthy', async () => {
    const service = new HealthService(
      {
        get: vi.fn((key: string) => {
          if (key === 'MONGO_URI') {
            return 'mongodb://localhost:27017/masik';
          }
          if (key === 'JWT_SECRET') {
            return 'secret';
          }
          return undefined;
        }),
      } as never,
      {
        isRegistrationHealthy: vi.fn().mockReturnValue(true),
      } as never,
      {
        readyState: 1,
        db: {
          admin: vi.fn().mockReturnValue({
            ping: vi.fn().mockResolvedValue({ ok: 1 }),
          }),
        },
      } as never,
    );

    await expect(service.ready()).resolves.toMatchObject({
      status: 'ready',
      service: 'masik-backend',
      checks: {
        db: { status: 'ok' },
        config: { status: 'ok' },
        cron: { status: 'ok' },
      },
    });
  });

  it('reports not_ready when db ping fails or scheduler is not armed', async () => {
    const service = new HealthService(
      {
        get: vi.fn((key: string) => {
          if (key === 'MONGO_URI') {
            return 'mongodb://localhost:27017/masik';
          }
          if (key === 'JWT_SECRET') {
            return 'secret';
          }
          return undefined;
        }),
      } as never,
      {
        isRegistrationHealthy: vi.fn().mockReturnValue(false),
      } as never,
      {
        readyState: 1,
        db: {
          admin: vi.fn().mockReturnValue({
            ping: vi.fn().mockRejectedValue(new Error('down')),
          }),
        },
      } as never,
    );

    await expect(service.ready()).resolves.toMatchObject({
      status: 'not_ready',
      checks: {
        db: { status: 'fail' },
        cron: { status: 'fail' },
      },
    });
  });
});
