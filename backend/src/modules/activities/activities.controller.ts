import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { AuthGuard } from '../../common/auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CurrentUser } from '../../common/user.decorator';
import { ProjectsService } from '../projects/projects.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UserPayload } from '../../common/types';

@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get('projects/:projectId/activities')
  async findByProject(
    @Param('projectId') projectId: string,
    @CurrentUser() currentUser: UserPayload,
  ) {
    await this.projectsService.validateAccess(projectId, currentUser);
    return this.activitiesService.findByProject(projectId);
  }

  @Post('activities')
  @Roles('pro')
  async create(
    @Body() body: CreateActivityDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.activitiesService.create(body, currentUser.id);
  }
}
