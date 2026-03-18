import { randomBytes } from 'crypto';
import { Inject, Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../../db/drizzle';
import { user, proClients } from '../../db/schema';
import { auth } from '../../config/auth';

@Injectable()
export class ProClientsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findByPro(proId: string) {
    const result = await this.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      })
      .from(proClients)
      .innerJoin(user, eq(proClients.clientId, user.id))
      .where(eq(proClients.proId, proId))
      .orderBy(user.name);

    return result;
  }

  async createAndLink(proId: string, data: { name: string; email: string }) {
    const existing = await this.db
      .select({ id: user.id, role: user.role })
      .from(user)
      .where(eq(user.email, data.email));

    let clientId: string;

    if (existing[0]) {
      if (existing[0].role !== 'client') {
        throw new ConflictException('This email belongs to a pro account');
      }
      clientId = existing[0].id;
    } else {
      const password = randomBytes(24).toString('base64url');
      const created = await auth.api.signUpEmail({
        body: {
          name: data.name,
          email: data.email,
          password,
          role: 'client',
        },
      });
      clientId = (created as { user: { id: string } }).user.id;
      await this.db.update(user).set({ emailVerified: false }).where(eq(user.id, clientId));
    }

    const linkExists = await this.db
      .select({ proId: proClients.proId })
      .from(proClients)
      .where(and(eq(proClients.proId, proId), eq(proClients.clientId, clientId)));

    if (linkExists[0]) {
      throw new ConflictException('Client already linked');
    }

    await this.db.insert(proClients).values({ proId, clientId });

    return this.db
      .select({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt })
      .from(user)
      .where(eq(user.id, clientId))
      .then((r) => r[0]);
  }

  async unlink(proId: string, clientId: string) {
    const link = await this.db
      .select({ proId: proClients.proId })
      .from(proClients)
      .where(and(eq(proClients.proId, proId), eq(proClients.clientId, clientId)));

    if (!link[0]) throw new NotFoundException('Link not found');

    await this.db
      .delete(proClients)
      .where(and(eq(proClients.proId, proId), eq(proClients.clientId, clientId)));

    return { deleted: true };
  }
}
