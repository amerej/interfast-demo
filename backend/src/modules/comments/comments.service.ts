import { Inject, Injectable } from '@nestjs/common';
import { eq, asc } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../../db/drizzle';
import { comments, user, activities } from '../../db/schema';
import { ActivitiesGateway } from '../activities/activities.gateway';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly activitiesGateway: ActivitiesGateway,
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
      await this.db.insert(activities).values({
        projectId: activity.projectId,
        userId,
        message: `Nouveau commentaire ajouté`,
      });
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
