import { Module } from "@nestjs/common";
import { DrizzleModule } from "./db/drizzle.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    DrizzleModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
