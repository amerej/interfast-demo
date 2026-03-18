import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { DRIZZLE } from '../../db/drizzle';
import { createMockDb } from '../../test/mock-db';

describe('UsersService', () => {
  let service: UsersService;
  let db: ReturnType<typeof createMockDb>;

  beforeEach(async () => {
    db = createMockDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DRIZZLE, useValue: db },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('findById', () => {
    it('should return user with projects', async () => {
      const mockUser = { id: 'u1', name: 'Jean', email: 'jean@test.com', role: 'client', createdAt: new Date() };
      const mockProjects = [{ id: 'p1', name: 'Project 1', status: 'in_progress' }];

      db._chain.where
        .mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce(mockProjects);

      const result = await service.findById('u1');

      expect(result).toEqual({ ...mockUser, projects: mockProjects });
      expect(db.select).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when user not found', async () => {
      db._chain.where.mockResolvedValueOnce([]);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
