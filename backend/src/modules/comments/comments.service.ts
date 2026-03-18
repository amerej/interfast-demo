import { Inject, Injectable } from '@nestjs/common';
import { eq, asc } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../../db/drizzle';
import { comments, user, activities, projects } from '../../db/schema';
import { ActivitiesGateway } from '../activities/activities.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly activitiesGateway: ActivitiesGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findByActivity(activityId: string) {
    return this.db
      .select({
        id: comments.id,
        activityId: comments.activityId,
        userId: comments.userId,
        userName: user.name,
        message: comments.message,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .leftJoin(user, eq(comments.userId, user.id))
      .where(eq(comments.activityId, activityId))
      .orderBy(asc(comments.createdAt));
  }

  async create(activityId: string, message: string, userId: string) {
    const [comment] = await this.db
      .insert(comments)
      .values({ activityId, userId, message })
      .returning();

    const [activity] = await this.db
      .select({ id: activities.id, projectId: activities.projectId })
      .from(activities)
      .where(eq(activities.id, activityId));

    if (activity) {
      // Notify the project's client about the new comment
      const [project] = await this.db
        .select({ clientId: projects.clientId, name: projects.name })
        .from(projects)
        .where(eq(projects.id, activity.projectId));

      if (project?.clientId && project.clientId !== userId) {
        const [author] = await this.db
          .select({ name: user.name })
          .from(user)
          .where(eq(user.id, userId));

        const notif = await this.notificationsService.create({
          userId: project.clientId,
          message: `${author?.name ?? 'Quelqu\'un'} a commenté une activité sur "${project.name}"`,
          projectId: activity.projectId,
          type: 'comment',
        });

        this.activitiesGateway.emitNotification(project.clientId, notif);
      }
    }

    const [enriched] = await this.db
      .select({
        id: comments.id,
        activityId: comments.activityId,
        userId: comments.userId,
        userName: user.name,
        message: comments.message,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .leftJoin(user, eq(comments.userId, user.id))
      .where(eq(comments.id, comment.id));

    if (activity) {
      this.activitiesGateway.emitNewComment(activity.projectId, enriched);
    }

    return enriched;
  }
}
