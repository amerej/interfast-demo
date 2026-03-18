import { Module, forwardRef } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivitiesGateway } from './activities.gateway';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';
import { ProjectsModule } from '../projects/projects.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [forwardRef(() => ProjectsModule), NotificationsModule],
  controllers: [ActivitiesController, AttachmentsController],
  providers: [ActivitiesService, ActivitiesGateway, AttachmentsService],
  exports: [ActivitiesService, ActivitiesGateway],
})
export class ActivitiesModule {}
