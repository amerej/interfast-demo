import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createDrizzle } from '../db/drizzle';
import * as schema from '../db/schema';

const db = createDrizzle(
  process.env.DATABASE_URL ?? 'postgres://portal:portal@postgres:5432/portal',
);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:8080',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  basePath: '/auth',
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    autoSignIn: false,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'client',
        input: true,
      },
      tradeId: {
        type: 'string',
        required: false,
        defaultValue: null,
        input: true,
      },
    },
  },
  trustedOrigins: [
    process.env.FRONTEND_URL ?? 'http://localhost:8080',
    'http://localhost:8080',
    'http://localhost:5173',
  ],
});

export type Auth = typeof auth;
