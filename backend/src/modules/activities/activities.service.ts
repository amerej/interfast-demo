import { Inject, Injectable } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../../db/drizzle';
import { activities, user, projects } from '../../db/schema';
import { ActivitiesGateway } from './activities.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ActivitiesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly activitiesGateway: ActivitiesGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findByProject(projectId: string) {
    const rows = await this.db
      .select({
        id: activities.id,
        projectId: activities.projectId,
        userId: activities.userId,
        userName: user.name,
        message: activities.message,
        createdAt: activities.createdAt,
      })
      .from(activities)
      .leftJoin(user, eq(activities.userId, user.id))
      .where(eq(activities.projectId, projectId))
      .orderBy(desc(activities.createdAt));

    return rows;
  }

  async create(
    data: { projectId: string; message: string },
    userId: string,
  ) {
    const [activity] = await this.db
      .insert(activities)
      .values({
        projectId: data.projectId,
        userId,
        message: data.message,
      })
      .returning();

    this.activitiesGateway.emitNewActivity(data.projectId, activity);

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
        message: `${author?.name ?? 'Votre pro'} a publié une mise à jour sur "${project.name}"`,
        projectId: data.projectId,
        type: 'activity',
      });

      this.activitiesGateway.emitNotification(project.clientId, notif);
    }

    return activity;
  }
}
