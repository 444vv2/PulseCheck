import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const config = { getOrThrow: jest.fn().mockReturnValue('refresh-secret') };
  const jwt = { signAsync: jest.fn(), verifyAsync: jest.fn() };

  beforeEach(() => jest.clearAllMocks());

  it('rejects login for an unknown email', async () => {
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue(null) } };
    const service = new AuthService(prisma as never, jwt as never, config as never);

    await expect(
      service.login({ email: 'nobody@example.com', password: 'password123' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects refresh without a cookie token', async () => {
    const service = new AuthService({} as never, jwt as never, config as never);

    await expect(service.refresh(undefined)).rejects.toThrow(UnauthorizedException);
  });
});
