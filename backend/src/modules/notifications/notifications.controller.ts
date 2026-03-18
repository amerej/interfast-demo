import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../../common/auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CurrentUser } from '../../common/user.decorator';
import { UserPayload } from '../../common/types';

@Controller('notifications')
@UseGuards(AuthGuard, RolesGuard)
@Roles('client')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentUser() currentUser: UserPayload) {
    return this.notificationsService.findByUser(currentUser.id);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() currentUser: UserPayload) {
    return this.notificationsService.markAllRead(currentUser.id);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.notificationsService.markRead(id, currentUser.id);
  }
}
