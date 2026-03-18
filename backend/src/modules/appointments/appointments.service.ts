import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { eq, or } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../../db/drizzle';
import { appointments, user } from '../../db/schema';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivitiesGateway } from '../activities/activities.gateway';

@Injectable()
export class AppointmentsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly notificationsService: NotificationsService,
    private readonly activitiesGateway: ActivitiesGateway,
  ) {}

  async findByUser(userId: string, role: string) {
    if (role === 'pro') {
      return this.db
        .select()
        .from(appointments)
        .where(eq(appointments.userId, userId))
        .orderBy(appointments.startDate);
    }

    return this.db
      .select()
      .from(appointments)
      .where(eq(appointments.clientId, userId))
      .orderBy(appointments.startDate);
  }

  async create(
    data: { title: string; description?: string; startDate: string; endDate: string; allDay?: boolean; clientId: string },
    userId: string,
  ) {
    const [appointment] = await this.db
      .insert(appointments)
      .values({
        title: data.title,
        description: data.description ?? null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        allDay: data.allDay ?? false,
        userId,
        clientId: data.clientId,
      })
      .returning();

    const [author] = await this.db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, userId));

    const dateStr = new Date(data.startDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const notif = await this.notificationsService.create({
      userId: data.clientId,
      message: `${author?.name ?? 'Votre pro'} a créé un rendez-vous "${data.title}" le ${dateStr}`,
      type: 'appointment',
    });
    this.activitiesGateway.emitNotification(data.clientId, notif);
    this.activitiesGateway.emitAppointmentUpdate(data.clientId);

    return appointment;
  }

  async update(
    id: string,
    data: { title?: string; description?: string; startDate?: string; endDate?: string; allDay?: boolean },
    userId: string,
  ) {
    const existing = await this.db
      .select({ id: appointments.id, userId: appointments.userId, clientId: appointments.clientId })
      .from(appointments)
      .where(eq(appointments.id, id));
    if (!existing[0]) throw new NotFoundException('Appointment not found');
    if (existing[0].userId !== userId) throw new ForbiddenException('Access denied');

    const updateData: Partial<{
      title: string;
      description: string;
      startDate: Date;
      endDate: Date;
      allDay: boolean;
    }> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.allDay !== undefined) updateData.allDay = data.allDay;

    const [updated] = await this.db
      .update(appointments)
      .set(updateData)
      .where(eq(appointments.id, id))
      .returning();

    if (existing[0].clientId) {
      this.activitiesGateway.emitAppointmentUpdate(existing[0].clientId);
    }

    return updated;
  }

  async remove(id: string, userId: string) {
    const existing = await this.db
      .select({ id: appointments.id, userId: appointments.userId, clientId: appointments.clientId })
      .from(appointments)
      .where(eq(appointments.id, id));
    if (!existing[0]) throw new NotFoundException('Appointment not found');
    if (existing[0].userId !== userId) throw new ForbiddenException('Access denied');

    await this.db.delete(appointments).where(eq(appointments.id, id));

    if (existing[0].clientId) {
      this.activitiesGateway.emitAppointmentUpdate(existing[0].clientId);
    }

    return { deleted: true };
  }
}
