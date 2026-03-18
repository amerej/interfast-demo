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
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../../common/auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CurrentUser } from '../../common/user.decorator';
import { UserPayload } from '../../common/types';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
@UseGuards(AuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(@CurrentUser() currentUser: UserPayload) {
    if (currentUser.role === 'pro') {
      return this.projectsService.findByPro(currentUser.id);
    }
    return this.projectsService.findByClient(currentUser.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.projectsService.validateAccess(id, currentUser);
  }

  @Post()
  @Roles('pro')
  async create(@Body() body: CreateProjectDto, @CurrentUser() currentUser: UserPayload) {
    return this.projectsService.create(body, currentUser.id);
  }

  @Patch(':id')
  @Roles('pro')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateProjectDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.projectsService.update(id, body, currentUser.id);
  }

  @Delete(':id')
  @Roles('pro')
  async remove(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.projectsService.remove(id, currentUser.id);
  }
}
