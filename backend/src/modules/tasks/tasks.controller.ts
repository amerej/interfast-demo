import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthGuard } from '../../common/auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CurrentUser } from '../../common/user.decorator';
import { ProjectsService } from '../projects/projects.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserPayload } from '../../common/types';

@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get('projects/:projectId/tasks')
  async findByProject(
    @Param('projectId') projectId: string,
    @CurrentUser() currentUser: UserPayload,
  ) {
    await this.projectsService.validateAccess(projectId, currentUser);
    return this.tasksService.findByProject(projectId);
  }

  @Post('tasks')
  @Roles('pro')
  async create(
    @Body() body: CreateTaskDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.tasksService.create(body, currentUser.id);
  }

  @Patch('tasks/:id')
  @Roles('pro')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.tasksService.update(id, body, currentUser.id);
  }

  @Delete('tasks/:id')
  @Roles('pro')
  async remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
