import { Inject, Injectable, NotFoundException, ForbiddenException, forwardRef } from '@nestjs/common';
import { eq, sql, and } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../../db/drizzle';
import { projects, tasks, user, proClients, trades } from '../../db/schema';
import { ActivitiesGateway } from '../activities/activities.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    @Inject(forwardRef(() => ActivitiesGateway)) private readonly activitiesGateway: ActivitiesGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findByPro(proId: string) {
    const result = await this.db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        startDate: projects.startDate,
        estimatedEndDate: projects.estimatedEndDate,
        clientId: projects.clientId,
        clientName: user.name,
        proId: projects.proId,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .leftJoin(user, eq(projects.clientId, user.id))
      .where(eq(projects.proId, proId));

    return Promise.all(result.map((p) => this.addProgress(p)));
  }

  async findByClient(clientId: string) {
    const pro = this.db
      .select({
        id: user.id,
        name: user.name,
        tradeId: user.tradeId,
      })
      .from(user)
      .as('pro');

    const result = await this.db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        startDate: projects.startDate,
        estimatedEndDate: projects.estimatedEndDate,
        clientId: projects.clientId,
        proId: projects.proId,
        proName: pro.name,
        tradeName: trades.name,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .leftJoin(pro, eq(projects.proId, pro.id))
      .leftJoin(trades, eq(pro.tradeId, trades.id))
      .where(eq(projects.clientId, clientId));

    return Promise.all(result.map((p) => this.addProgress(p)));
  }

  async findOne(id: string) {
    const pro = this.db
      .select({
        id: user.id,
        name: user.name,
        tradeId: user.tradeId,
      })
      .from(user)
      .as('pro');

    const client = this.db
      .select({
        id: user.id,
        name: user.name,
      })
      .from(user)
      .as('client');

    const result = await this.db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        startDate: projects.startDate,
        estimatedEndDate: projects.estimatedEndDate,
        clientId: projects.clientId,
        clientName: client.name,
        proId: projects.proId,
        proName: pro.name,
        tradeName: trades.name,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .leftJoin(client, eq(projects.clientId, client.id))
      .leftJoin(pro, eq(projects.proId, pro.id))
      .leftJoin(trades, eq(pro.tradeId, trades.id))
      .where(eq(projects.id, id));

    if (!result[0]) throw new NotFoundException('Project not found');

    return this.addProgress(result[0]);
  }

  async create(
    data: { name: string; clientId: string; status?: string; startDate?: string; estimatedEndDate?: string },
    proId: string,
  ) {
    const link = await this.db
      .select({ proId: proClients.proId })
      .from(proClients)
      .where(and(eq(proClients.proId, proId), eq(proClients.clientId, data.clientId)));

    if (!link[0]) throw new ForbiddenException('Client not linked to your account');

    const [project] = await this.db
      .insert(projects)
      .values({
        name: data.name,
        clientId: data.clientId,
        proId,
        status: data.status ?? 'planning',
        startDate: data.startDate ? new Date(data.startDate) : null,
        estimatedEndDate: data.estimatedEndDate ? new Date(data.estimatedEndDate) : null,
      })
      .returning();

    this.activitiesGateway.emitProjectUpdate(data.clientId, project);

    const [author] = await this.db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, proId));

    const notif = await this.notificationsService.create({
      userId: data.clientId,
      message: `${author?.name ?? 'Votre pro'} a créé un nouveau projet "${project.name}"`,
      projectId: project.id,
      type: 'project',
    });

    this.activitiesGateway.emitNotification(data.clientId, notif);

    return project;
  }

  async update(
    id: string,
    data: { name?: string; status?: string; startDate?: string; estimatedEndDate?: string },
    proId: string,
  ) {
    const existing = await this.db
      .select({ id: projects.id, proId: projects.proId, clientId: projects.clientId })
      .from(projects)
      .where(eq(projects.id, id));
    if (!existing[0]) throw new NotFoundException('Project not found');
    if (existing[0].proId !== proId) throw new ForbiddenException('Access denied');

    const updateData: Partial<{
      name: string;
      status: string;
      startDate: Date;
      estimatedEndDate: Date;
    }> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.estimatedEndDate !== undefined) updateData.estimatedEndDate = new Date(data.estimatedEndDate);

    const [updated] = await this.db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();

    this.activitiesGateway.emitProjectUpdate(existing[0].clientId, updated);

    if (existing[0].clientId) {
      const [author] = await this.db
        .select({ name: user.name })
        .from(user)
        .where(eq(user.id, proId));

      const notif = await this.notificationsService.create({
        userId: existing[0].clientId,
        message: `${author?.name ?? 'Votre pro'} a modifié le projet "${updated.name}"`,
        projectId: id,
        type: 'project',
      });

      this.activitiesGateway.emitNotification(existing[0].clientId, notif);
    }

    return updated;
  }

  async validateAccess(projectId: string, currentUser: { id: string; role: string }) {
    const project = await this.findOne(projectId);
    if (currentUser.role === 'pro' && project.proId !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }
    if (currentUser.role === 'client' && project.clientId !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }
    return project;
  }

  async remove(id: string, proId: string) {
    const existing = await this.db
      .select({ id: projects.id, proId: projects.proId, clientId: projects.clientId })
      .from(projects)
      .where(eq(projects.id, id));
    if (!existing[0]) throw new NotFoundException('Project not found');
    if (existing[0].proId !== proId) throw new ForbiddenException('Access denied');

    await this.db.delete(projects).where(eq(projects.id, id));

    this.activitiesGateway.emitProjectUpdate(existing[0].clientId, { id, deleted: true });

    return { deleted: true };
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
