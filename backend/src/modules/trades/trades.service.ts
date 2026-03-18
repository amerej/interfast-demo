import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../../db/drizzle';
import { trades, tradeCategories } from '../../db/schema';

@Injectable()
export class TradesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll() {
    return this.db.select().from(trades).orderBy(trades.name);
  }

  async findCategories(tradeId: string) {
    return this.db
      .select()
      .from(tradeCategories)
      .where(eq(tradeCategories.tradeId, tradeId))
      .orderBy(tradeCategories.name);
  }
}
