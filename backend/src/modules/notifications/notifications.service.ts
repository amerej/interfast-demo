import { Inject, Injectable } from '@nestjs/common';
import { eq, desc, and } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../../db/drizzle';
import { notifications } from '../../db/schema';

@Injectable()
export class NotificationsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(data: { userId: string; message: string; projectId?: string; type?: string }) {
    const [notif] = await this.db
      .insert(notifications)
      .values({
        userId: data.userId,
        message: data.message,
        projectId: data.projectId,
        type: data.type ?? 'activity',
      })
      .returning();
    return notif;
  }

  async findByUser(userId: string) {
    return this.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async markRead(id: string, userId: string) {
    const [updated] = await this.db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();
    return updated;
  }

  async markAllRead(userId: string) {
    await this.db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
    return { ok: true };
  }
}
