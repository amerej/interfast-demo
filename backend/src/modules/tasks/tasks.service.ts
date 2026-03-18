import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../../db/drizzle';
import { tasks, activities, projects, user } from '../../db/schema';
import { ActivitiesGateway } from '../activities/activities.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly activitiesGateway: ActivitiesGateway,
    private readonly notificationsService: NotificationsService,
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

    // Notify the project's client
    const [project] = await this.db
      .select({ clientId: projects.clientId, name: projects.name })
      .from(projects)
      .where(eq(projects.id, data.projectId));

    if (project?.clientId) {
      const [author] = await this.db
        .select({ name: user.name })
        .from(user)
        .where(eq(user.id, userId));

      const notif = await this.notificationsService.create({
        userId: project.clientId,
        message: `${author?.name ?? 'Votre pro'} a ajouté une tâche "${data.title}" sur "${project.name}"`,
        projectId: data.projectId,
        type: 'task',
      });

      this.activitiesGateway.emitNotification(project.clientId, notif);
    }

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

      // Notify the project's client
      const [project] = await this.db
        .select({ clientId: projects.clientId, name: projects.name })
        .from(projects)
        .where(eq(projects.id, existing[0].projectId));

      if (project?.clientId) {
        const [author] = await this.db
          .select({ name: user.name })
          .from(user)
          .where(eq(user.id, userId));

        const notif = await this.notificationsService.create({
          userId: project.clientId,
          message: `${author?.name ?? 'Votre pro'} a marqué la tâche "${existing[0].title}" comme ${statusLabel} sur "${project.name}"`,
          projectId: existing[0].projectId,
          type: 'task',
        });

        this.activitiesGateway.emitNotification(project.clientId, notif);
      }
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
