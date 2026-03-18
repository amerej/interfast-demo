import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { ActivitiesGateway } from '../activities/activities.gateway';
import { DRIZZLE } from '../../db/drizzle';
import { createMockDb } from '../../test/mock-db';

describe('CommentsService', () => {
  let service: CommentsService;
  let db: ReturnType<typeof createMockDb>;

  beforeEach(async () => {
    db = createMockDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: DRIZZLE, useValue: db },
        { provide: ActivitiesGateway, useValue: { emitNewComment: jest.fn() } },
      ],
    }).compile();

    service = module.get(CommentsService);
  });

  describe('findByActivity', () => {
    it('should return comments for an activity', async () => {
      const mockComments = [
        { id: 'c1', activityId: 'a1', userId: 'u1', userName: 'Jean', message: 'Nice', createdAt: new Date() },
      ];
      db._chain.orderBy.mockResolvedValueOnce(mockComments);

      const result = await service.findByActivity('a1');

      expect(result).toEqual(mockComments);
    });
  });

  describe('create', () => {
    it('should create comment, activity event, and return enriched comment', async () => {
      const comment = { id: 'c1', activityId: 'a1', userId: 'u1', message: 'Hello' };
      const activity = { id: 'a1', projectId: 'p1' };
      const enriched = { ...comment, userName: 'Jean', createdAt: new Date() };

      db._chain.returning.mockResolvedValueOnce([comment]);
      db._chain.where.mockResolvedValueOnce([activity]);
      db._chain.returning.mockResolvedValueOnce([]);
      db._chain.where.mockResolvedValueOnce([enriched]);

      const result = await service.create('a1', 'Hello', 'u1');

      expect(result).toEqual(enriched);
      expect(db.insert).toHaveBeenCalledTimes(2);
    });

    it('should skip activity creation when original activity not found', async () => {
      const comment = { id: 'c1', activityId: 'a1', userId: 'u1', message: 'Hello' };
      const enriched = { ...comment, userName: 'Jean', createdAt: new Date() };

      db._chain.returning.mockResolvedValueOnce([comment]);
      db._chain.where.mockResolvedValueOnce([]);
      db._chain.where.mockResolvedValueOnce([enriched]);

      const result = await service.create('a1', 'Hello', 'u1');

      expect(result).toEqual(enriched);
      expect(db.insert).toHaveBeenCalledTimes(1);
    });
  });
});
