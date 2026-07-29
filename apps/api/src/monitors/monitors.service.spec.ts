import { NotFoundException } from '@nestjs/common';
import { MonitorsService } from './monitors.service';

describe('MonitorsService', () => {
  it('does not return a monitor owned by another user', async () => {
    const prisma = {
      monitor: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const service = new MonitorsService(prisma as never);

    await expect(service.findOne('user-a', 'monitor-b')).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.monitor.findFirst).toHaveBeenCalledWith({
      where: { id: 'monitor-b', ownerId: 'user-a' },
    });
  });
});
