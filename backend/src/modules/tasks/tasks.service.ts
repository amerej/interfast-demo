import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../../db/drizzle';
import { tasks, activities } from '../../db/schema';
import { ActivitiesGateway } from '../activities/activities.gateway';

@Injectable()
export class TasksService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly activitiesGateway: ActivitiesGateway,
  ) {}

  async findByProject(projectId: string) {
    return this.db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .orderBy(tasks.createdAt);
  }

  async create(
    data: { projectId: string; title: string; status?: string; category?: string },
    userId: string,
  ) {
    const [task] = await this.db
      .insert(tasks)
      .values({
        projectId: data.projectId,
        title: data.title,
        status: data.status ?? 'todo',
        category: data.category ?? null,
      })
      .returning();

    await this.db.insert(activities).values({
      projectId: data.projectId,
      userId,
      message: `Tâche créée: ${data.title}`,
    });

    this.activitiesGateway.emitTaskUpdate(data.projectId, task);

    return task;
  }

  async update(
    id: string,
    data: { title?: string; status?: string; category?: string },
    userId: string,
  ) {
    const existing = await this.db
      .select({ id: tasks.id, projectId: tasks.projectId, title: tasks.title, status: tasks.status })
      .from(tasks)
      .where(eq(tasks.id, id));
    if (!existing[0]) throw new NotFoundException('Task not found');

    const [updated] = await this.db
      .update(tasks)
      .set(data)
      .where(eq(tasks.id, id))
      .returning();

    if (data.status && data.status !== existing[0].status) {
      const statusLabel = data.status === 'done' ? 'terminée' : data.status === 'doing' ? 'en cours' : 'à faire';
      await this.db.insert(activities).values({
        projectId: existing[0].projectId,
        userId,
        message: `Tâche "${existing[0].title}" marquée comme ${statusLabel}`,
      });
    }

    this.activitiesGateway.emitTaskUpdate(existing[0].projectId, updated);

    return updated;
  }

  async remove(id: string) {
    const existing = await this.db
      .select({ id: tasks.id, projectId: tasks.projectId })
      .from(tasks)
      .where(eq(tasks.id, id));
    if (!existing[0]) throw new NotFoundException('Task not found');

    await this.db.delete(tasks).where(eq(tasks.id, id));

    this.activitiesGateway.emitTaskUpdate(existing[0].projectId, { id, deleted: true });

    return { deleted: true };
  }
}
