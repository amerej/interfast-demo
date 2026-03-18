jest.mock('../../config/auth', () => ({
  auth: { api: { getSession: jest.fn() } },
}));
jest.mock('better-auth/node', () => ({
  toNodeHandler: jest.fn(),
  fromNodeHeaders: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ProjectsService } from '../projects/projects.service';
import { AuthGuard } from '../../common/auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { UserPayload } from '../../common/types';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: jest.Mocked<Pick<TasksService, 'findByProject' | 'create' | 'update' | 'remove'>>;
  let projectsService: jest.Mocked<Pick<ProjectsService, 'findOne' | 'validateAccess'>>;

  beforeEach(async () => {
    tasksService = {
      findByProject: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    projectsService = {
      findOne: jest.fn(),
      validateAccess: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        { provide: TasksService, useValue: tasksService },
        { provide: ProjectsService, useValue: projectsService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(TasksController);
  });

  const pro: UserPayload = { id: 'pro-1', name: 'Pro', email: 'pro@test.com', role: 'pro', tradeId: null };
  const client: UserPayload = { id: 'user-1', name: 'Jean', email: 'jean@test.com', role: 'client', tradeId: null };

  describe('findByProject', () => {
    it('should validate access and return tasks', async () => {
      projectsService.validateAccess.mockResolvedValue({} as any);
      tasksService.findByProject.mockResolvedValue([{ id: 't1' }] as any);

      const result = await controller.findByProject('p1', pro);

      expect(result).toEqual([{ id: 't1' }]);
      expect(projectsService.validateAccess).toHaveBeenCalledWith('p1', pro);
    });

    it('should deny client access to another project', async () => {
      projectsService.validateAccess.mockRejectedValue(new ForbiddenException('Access denied'));

      await expect(controller.findByProject('p1', client)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('should create a task', async () => {
      const dto = { projectId: 'p1', title: 'New Task' } as any;
      tasksService.create.mockResolvedValue({ id: 't1', ...dto, status: 'todo' } as any);

      const result = await controller.create(dto, pro);

      expect(result.title).toBe('New Task');
      expect(tasksService.create).toHaveBeenCalledWith(dto, 'pro-1');
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const dto = { status: 'done' } as any;
      tasksService.update.mockResolvedValue({ id: 't1', status: 'done' } as any);

      const result = await controller.update('t1', dto, pro);

      expect(result.status).toBe('done');
      expect(tasksService.update).toHaveBeenCalledWith('t1', dto, 'pro-1');
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      tasksService.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove('t1');

      expect(result).toEqual({ deleted: true });
    });
  });
});
