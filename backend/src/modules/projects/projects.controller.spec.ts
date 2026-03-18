jest.mock('../../config/auth', () => ({
  auth: { api: { getSession: jest.fn() } },
}));
jest.mock('better-auth/node', () => ({
  toNodeHandler: jest.fn(),
  fromNodeHeaders: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../../common/auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { UserPayload } from '../../common/types';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let projectsService: jest.Mocked<Pick<ProjectsService, 'findByPro' | 'findByClient' | 'findOne' | 'validateAccess'>>;

  beforeEach(async () => {
    projectsService = {
      findByPro: jest.fn(),
      findByClient: jest.fn(),
      findOne: jest.fn(),
      validateAccess: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [{ provide: ProjectsService, useValue: projectsService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(ProjectsController);
  });

  const pro: UserPayload = { id: 'pro-1', name: 'Pro', email: 'pro@test.com', role: 'pro', tradeId: null };
  const client: UserPayload = { id: 'user-1', name: 'Jean', email: 'jean@test.com', role: 'client', tradeId: null };

  describe('findAll', () => {
    it('should return all projects for pro', async () => {
      projectsService.findByPro.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }] as any);

      const result = await controller.findAll(pro);

      expect(result).toHaveLength(2);
      expect(projectsService.findByPro).toHaveBeenCalledWith('pro-1');
      expect(projectsService.findByClient).not.toHaveBeenCalled();
    });

    it('should return only client projects for client', async () => {
      projectsService.findByClient.mockResolvedValue([{ id: 'p1' }] as any);

      const result = await controller.findAll(client);

      expect(result).toHaveLength(1);
      expect(projectsService.findByClient).toHaveBeenCalledWith('user-1');
      expect(projectsService.findByPro).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should validate access and return project', async () => {
      projectsService.validateAccess.mockResolvedValue({ id: 'p1', clientId: 'user-1' } as any);

      const result = await controller.findOne('p1', client);

      expect(result.id).toBe('p1');
      expect(projectsService.validateAccess).toHaveBeenCalledWith('p1', client);
    });

    it('should deny access when validation fails', async () => {
      projectsService.validateAccess.mockRejectedValue(new ForbiddenException('Access denied'));

      await expect(controller.findOne('p1', client)).rejects.toThrow(ForbiddenException);
    });
  });
});
