import { Module } from "@nestjs/common";
import { DrizzleModule } from "./db/drizzle.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { ActivitiesModule } from "./modules/activities/activities.module";
import { CommentsModule } from "./modules/comments/comments.module";
import { TradesModule } from "./modules/trades/trades.module";
import { ProClientsModule } from "./modules/pro-clients/pro-clients.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { AppointmentsModule } from "./modules/appointments/appointments.module";

@Module({
  imports: [
    DrizzleModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    ActivitiesModule,
    CommentsModule,
    TradesModule,
    ProClientsModule,
    NotificationsModule,
    AppointmentsModule,
  ],
})
export class AppModule {}
