import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../../common/auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { CurrentUser } from '../../common/user.decorator';
import { UserPayload } from '../../common/types';

@Controller('projects')
@UseGuards(AuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(@CurrentUser() currentUser: UserPayload) {
    return this.projectsService.findByClient(currentUser.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.projectsService.validateAccess(id, currentUser);
  }
}
