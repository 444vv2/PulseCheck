import { HealthService } from './health.service';

describe('HealthService', () => {
  it('reports an available database', async () => {
    const prisma = { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };
    const service = new HealthService(prisma as never);

    await expect(service.check()).resolves.toEqual({ status: 'ok', database: 'up' });
  });

  it('reports an unavailable database', async () => {
    const prisma = { $queryRaw: jest.fn().mockRejectedValue(new Error('offline')) };
    const service = new HealthService(prisma as never);

    await expect(service.check()).resolves.toEqual({
      status: 'degraded',
      database: 'down',
    });
  });
});
