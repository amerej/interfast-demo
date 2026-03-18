import { Inject, Injectable, NotFoundException, ForbiddenException, forwardRef } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../../db/drizzle';
import { projects, tasks, user } from '../../db/schema';
import { ActivitiesGateway } from '../activities/activities.gateway';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    @Inject(forwardRef(() => ActivitiesGateway)) private readonly activitiesGateway: ActivitiesGateway,
  ) {}

  async findByClient(clientId: string) {
    const result = await this.db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        startDate: projects.startDate,
        estimatedEndDate: projects.estimatedEndDate,
        clientId: projects.clientId,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .where(eq(projects.clientId, clientId));

    return Promise.all(result.map((p) => this.addProgress(p)));
  }

  async findOne(id: string) {
    const result = await this.db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        startDate: projects.startDate,
        estimatedEndDate: projects.estimatedEndDate,
        clientId: projects.clientId,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .where(eq(projects.id, id));

    if (!result[0]) throw new NotFoundException('Project not found');

    return this.addProgress(result[0]);
  }

  async validateAccess(projectId: string, currentUser: { id: string; role: string }) {
    const project = await this.findOne(projectId);
    if (currentUser.role === 'client' && project.clientId !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }
    return project;
  }

  private async addProgress<T extends { id: string }>(project: T) {
    const taskCounts = await this.db
      .select({
        total: sql<number>`count(*)::int`,
        done: sql<number>`count(*) filter (where ${tasks.status} = 'done')::int`,
      })
      .from(tasks)
      .where(eq(tasks.projectId, project.id));

    const { total, done } = taskCounts[0] ?? { total: 0, done: 0 };
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    return { ...project, progress, taskStats: { total, done } };
  }
}
