import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../../db/drizzle';
import { user, projects, trades } from '../../db/schema';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findById(id: string) {
    const result = await this.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tradeId: user.tradeId,
        tradeName: trades.name,
        createdAt: user.createdAt,
      })
      .from(user)
      .leftJoin(trades, eq(user.tradeId, trades.id))
      .where(eq(user.id, id));

    if (!result[0]) throw new NotFoundException('User not found');

    const userProjects = await this.db
      .select({ id: projects.id, name: projects.name, status: projects.status })
      .from(projects)
      .where(eq(projects.clientId, id));

    return { ...result[0], projects: userProjects };
  }

  async update(id: string, data: { tradeId?: string }) {
    const existing = await this.db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, id));
    if (!existing[0]) throw new NotFoundException('User not found');

    const updateData: Partial<{ tradeId: string }> = {};
    if (data.tradeId !== undefined) updateData.tradeId = data.tradeId;

    const [updated] = await this.db
      .update(user)
      .set(updateData)
      .where(eq(user.id, id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tradeId: user.tradeId,
      });

    return updated;
  }
}
