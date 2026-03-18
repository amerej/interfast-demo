import { Module } from "@nestjs/common";
import { DrizzleModule } from "./db/drizzle.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { ActivitiesModule } from "./modules/activities/activities.module";
import { CommentsModule } from "./modules/comments/comments.module";

@Module({
  imports: [
    DrizzleModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    ActivitiesModule,
    CommentsModule,
  ],
})
export class AppModule {}
