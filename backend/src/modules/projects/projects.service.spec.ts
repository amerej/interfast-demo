import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ActivitiesGateway } from '../activities/activities.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { DRIZZLE } from '../../db/drizzle';
import { createMockDb } from '../../test/mock-db';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let db: ReturnType<typeof createMockDb>;

  beforeEach(async () => {
    db = createMockDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: DRIZZLE, useValue: db },
        { provide: ActivitiesGateway, useValue: { emitProjectUpdate: jest.fn(), emitNotification: jest.fn() } },
        { provide: NotificationsService, useValue: { create: jest.fn().mockResolvedValue({ id: 'n1' }) } },
      ],
    }).compile();

    service = module.get(ProjectsService);
  });

  const mockProject = {
    id: 'p1',
    name: 'Test Project',
    status: 'in_progress',
    startDate: new Date(),
    estimatedEndDate: new Date(),
    clientId: 'u1',
    clientName: 'Jean',
    createdAt: new Date(),
  };

  describe('findByPro', () => {
    it('should return projects with progress', async () => {
      // findByPro: .select().from().leftJoin().where() → resolves to projects
      db._chain.where.mockResolvedValueOnce([mockProject]);
      // addProgress: .select().from(tasks).where() → resolves to task counts
      db._chain.where.mockResolvedValueOnce([{ total: 10, done: 7 }]);

      const result = await service.findByPro('pro1');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: 'Test Project',
        progress: 70,
        taskStats: { total: 10, done: 7 },
      });
    });

    it('should return 0 progress when no tasks', async () => {
      db._chain.where.mockResolvedValueOnce([mockProject]);
      db._chain.where.mockResolvedValueOnce([{ total: 0, done: 0 }]);

      const result = await service.findByPro('pro1');

      expect(result[0].progress).toBe(0);
    });
  });

  describe('findByClient', () => {
    it('should return client projects with progress', async () => {
      db._chain.where.mockResolvedValueOnce([mockProject]);
      db._chain.where.mockResolvedValueOnce([{ total: 4, done: 4 }]);

      const result = await service.findByClient('u1');

      expect(result).toHaveLength(1);
      expect(result[0].progress).toBe(100);
    });
  });

  describe('findOne', () => {
    it('should return a single project with progress', async () => {
      db._chain.where.mockResolvedValueOnce([mockProject]);
      db._chain.where.mockResolvedValueOnce([{ total: 5, done: 2 }]);

      const result = await service.findOne('p1');

      expect(result.progress).toBe(40);
      expect(result.taskStats).toEqual({ total: 5, done: 2 });
    });

    it('should throw NotFoundException when project not found', async () => {
      db._chain.where.mockResolvedValueOnce([]);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
