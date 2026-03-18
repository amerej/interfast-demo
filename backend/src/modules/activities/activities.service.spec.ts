import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesService } from './activities.service';
import { ActivitiesGateway } from './activities.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { DRIZZLE } from '../../db/drizzle';
import { createMockDb } from '../../test/mock-db';

describe('ActivitiesService', () => {
  let service: ActivitiesService;
  let db: ReturnType<typeof createMockDb>;

  beforeEach(async () => {
    db = createMockDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        { provide: DRIZZLE, useValue: db },
        { provide: ActivitiesGateway, useValue: { emitNewActivity: jest.fn(), emitNotification: jest.fn() } },
        { provide: NotificationsService, useValue: { create: jest.fn().mockResolvedValue({ id: 'n1' }) } },
      ],
    }).compile();

    service = module.get(ActivitiesService);
  });

  describe('findByProject', () => {
    it('should return activities for a project', async () => {
      const mockActivities = [
        { id: 'a1', projectId: 'p1', userId: 'u1', userName: 'Jean', message: 'Update', createdAt: new Date() },
      ];
      db._chain.orderBy.mockResolvedValueOnce(mockActivities);

      const result = await service.findByProject('p1');

      expect(result).toEqual(mockActivities);
    });
  });

  describe('create', () => {
    it('should create an activity', async () => {
      const newActivity = { id: 'a1', projectId: 'p1', userId: 'u1', message: 'Test', createdAt: null };
      db._chain.returning.mockResolvedValueOnce([newActivity]);
      // select project for notification
      db._chain.where.mockResolvedValueOnce([{ clientId: null, name: 'Project' }]);

      const result = await service.create({ projectId: 'p1', message: 'Test' }, 'u1');

      expect(result).toEqual(newActivity);
      expect(db.insert).toHaveBeenCalled();
    });

    it('should notify client when project has one', async () => {
      const newActivity = { id: 'a1', projectId: 'p1', userId: 'u1', message: 'Test', createdAt: null };
      db._chain.returning.mockResolvedValueOnce([newActivity]);
      // select project
      db._chain.where.mockResolvedValueOnce([{ clientId: 'c1', name: 'Project' }]);
      // select author name
      db._chain.where.mockResolvedValueOnce([{ name: 'Pro User' }]);

      const result = await service.create({ projectId: 'p1', message: 'Test' }, 'u1');

      expect(result).toEqual(newActivity);
    });
  });
});
