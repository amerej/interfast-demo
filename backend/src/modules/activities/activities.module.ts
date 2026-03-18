import { Module, forwardRef } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivitiesGateway } from './activities.gateway';
import { ProjectsModule } from '../projects/projects.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [forwardRef(() => ProjectsModule), NotificationsModule],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, ActivitiesGateway],
  exports: [ActivitiesService, ActivitiesGateway],
})
export class ActivitiesModule {}
