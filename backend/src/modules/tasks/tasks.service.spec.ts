import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ActivitiesGateway } from '../activities/activities.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { DRIZZLE } from '../../db/drizzle';
import { createMockDb } from '../../test/mock-db';

describe('TasksService', () => {
  let service: TasksService;
  let db: ReturnType<typeof createMockDb>;

  beforeEach(async () => {
    db = createMockDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: DRIZZLE, useValue: db },
        { provide: ActivitiesGateway, useValue: { emitTaskUpdate: jest.fn(), emitNotification: jest.fn() } },
        { provide: NotificationsService, useValue: { create: jest.fn().mockResolvedValue({ id: 'n1' }) } },
      ],
    }).compile();

    service = module.get(TasksService);
  });

  describe('findByProject', () => {
    it('should return tasks for a project', async () => {
      const mockTasks = [
        { id: 't1', projectId: 'p1', title: 'Task 1', status: 'todo' },
        { id: 't2', projectId: 'p1', title: 'Task 2', status: 'done' },
      ];
      db._chain.orderBy.mockResolvedValueOnce(mockTasks);

      const result = await service.findByProject('p1');

      expect(result).toEqual(mockTasks);
      expect(db.select).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a task and an activity', async () => {
      const newTask = { id: 't1', projectId: 'p1', title: 'New Task', status: 'todo', category: null, createdAt: null };
      db._chain.returning.mockResolvedValueOnce([newTask]);
      // select project for notification
      db._chain.where.mockResolvedValueOnce([{ clientId: null, name: 'Project' }]);

      const result = await service.create(
        { projectId: 'p1', title: 'New Task' },
        'user-1',
      );

      expect(result).toEqual(newTask);
      expect(db.insert).toHaveBeenCalledTimes(2);
    });

    it('should default status to todo', async () => {
      const newTask = { id: 't1', projectId: 'p1', title: 'Task', status: 'todo', category: null, createdAt: null };
      db._chain.returning.mockResolvedValueOnce([newTask]);
      db._chain.where.mockResolvedValueOnce([{ clientId: null, name: 'Project' }]);

      const result = await service.create({ projectId: 'p1', title: 'Task' }, 'user-1');

      expect(result.status).toBe('todo');
    });
  });

  describe('update', () => {
    const existingTask = { id: 't1', projectId: 'p1', title: 'Task', status: 'todo', category: null };

    it('should update a task', async () => {
      const updated = { ...existingTask, status: 'doing' };
      db._chain.where
        .mockResolvedValueOnce([existingTask])    // select existing
        .mockReturnValueOnce(db._chain)           // update().set().where() → chain
        .mockResolvedValueOnce([{ clientId: null, name: 'Project' }]); // select project
      db._chain.returning.mockResolvedValueOnce([updated]);

      const result = await service.update('t1', { status: 'doing' }, 'user-1');

      expect(result).toEqual(updated);
    });

    it('should create activity when status changes', async () => {
      db._chain.where
        .mockResolvedValueOnce([existingTask])
        .mockReturnValueOnce(db._chain)
        .mockResolvedValueOnce([{ clientId: null, name: 'Project' }]);
      db._chain.returning.mockResolvedValueOnce([{ ...existingTask, status: 'done' }]);

      await service.update('t1', { status: 'done' }, 'user-1');

      expect(db.insert).toHaveBeenCalledTimes(1);
    });

    it('should not create activity when status unchanged', async () => {
      db._chain.where
        .mockResolvedValueOnce([existingTask])
        .mockReturnValueOnce(db._chain);
      db._chain.returning.mockResolvedValueOnce([{ ...existingTask, title: 'Renamed' }]);

      await service.update('t1', { title: 'Renamed' }, 'user-1');

      expect(db.insert).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when task not found', async () => {
      db._chain.where.mockResolvedValueOnce([]);

      await expect(service.update('nonexistent', { status: 'done' }, 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      db._chain.where
        .mockResolvedValueOnce([{ id: 't1' }])
        .mockResolvedValueOnce(undefined);

      const result = await service.remove('t1');

      expect(result).toEqual({ deleted: true });
      expect(db.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when task not found', async () => {
      db._chain.where.mockResolvedValueOnce([]);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
