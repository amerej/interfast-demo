jest.mock('../../config/auth', () => ({
  auth: { api: { getSession: jest.fn() } },
}));
jest.mock('better-auth/node', () => ({
  toNodeHandler: jest.fn(),
  fromNodeHeaders: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthGuard } from '../../common/auth.guard';
import { UserPayload } from '../../common/types';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<Pick<UsersService, 'findById'>>;

  beforeEach(async () => {
    usersService = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(UsersController);
  });

  const pro: UserPayload = { id: 'pro-1', name: 'Pro', email: 'pro@test.com', role: 'pro', tradeId: null };
  const client: UserPayload = { id: 'user-1', name: 'Jean', email: 'jean@test.com', role: 'client', tradeId: null };

  it('should allow user to fetch own profile', async () => {
    const userData = { id: 'user-1', name: 'Jean', email: 'jean@test.com', role: 'client', projects: [] };
    usersService.findById.mockResolvedValue(userData as any);

    const result = await controller.getUser('user-1', client);

    expect(result).toEqual(userData);
    expect(usersService.findById).toHaveBeenCalledWith('user-1');
  });

  it('should allow pro to fetch any user', async () => {
    usersService.findById.mockResolvedValue({ id: 'user-1' } as any);

    const result = await controller.getUser('user-1', pro);

    expect(result).toEqual({ id: 'user-1' });
  });

  it('should deny client from fetching another user', async () => {
    await expect(controller.getUser('other-user', client)).rejects.toThrow(ForbiddenException);
    expect(usersService.findById).not.toHaveBeenCalled();
  });
});
