import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

export const DRIZZLE = Symbol('DRIZZLE');

export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;

export function createDrizzle(connectionString: string) {
  const pool = new Pool({ connectionString, max: 20 });
  return drizzle(pool, { schema });
}
