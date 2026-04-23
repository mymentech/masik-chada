import { describe, expect, it, vi } from 'vitest';
import { HealthService } from './health.service';

describe('HealthService', () => {
  it('reports ready when db, config, and scheduler are healthy', async () => {
    const service = new HealthService(
      {
        get: vi.fn((key: string) => {
          if (key === 'DATABASE_URL') return 'postgresql://localhost/masik';
          if (key === 'JWT_SECRET') return 'secret';
          return undefined;
        }),
      } as never,
      {
        isRegistrationHealthy: vi.fn().mockReturnValue(true),
      } as never,
      {
        isInitialized: true,
        query: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
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

  it('reports not_ready when db query fails or scheduler is not armed', async () => {
    const service = new HealthService(
      {
        get: vi.fn((key: string) => {
          if (key === 'DATABASE_URL') return 'postgresql://localhost/masik';
          if (key === 'JWT_SECRET') return 'secret';
          return undefined;
        }),
      } as never,
      {
        isRegistrationHealthy: vi.fn().mockReturnValue(false),
      } as never,
      {
        isInitialized: true,
        query: vi.fn().mockRejectedValue(new Error('down')),
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

  it('reports db fail when dataSource is not initialized', async () => {
    const service = new HealthService(
      {
        get: vi.fn((key: string) => {
          if (key === 'DATABASE_URL') return 'postgresql://localhost/masik';
          if (key === 'JWT_SECRET') return 'secret';
          return undefined;
        }),
      } as never,
      {
        isRegistrationHealthy: vi.fn().mockReturnValue(true),
      } as never,
      {
        isInitialized: false,
        query: vi.fn(),
      } as never,
    );

    const result = await service.ready();
    expect(result.checks.db.status).toBe('fail');
    expect(result.status).toBe('not_ready');
  });
});
