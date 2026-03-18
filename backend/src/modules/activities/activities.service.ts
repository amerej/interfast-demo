import { Inject, Injectable } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../../db/drizzle';
import { activities, user } from '../../db/schema';
import { ActivitiesGateway } from './activities.gateway';

@Injectable()
export class ActivitiesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly activitiesGateway: ActivitiesGateway,
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

    return activity;
  }
}
