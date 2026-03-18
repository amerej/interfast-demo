import { Module, Global } from '@nestjs/common';
import { DRIZZLE, createDrizzle } from './drizzle';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: () => {
        const dbUrl =
          process.env.DATABASE_URL ?? 'postgres://portal:portal@postgres:5432/portal';
        return createDrizzle(dbUrl);
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
