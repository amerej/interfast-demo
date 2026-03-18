import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AuthGuard } from '../../common/auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CurrentUser } from '../../common/user.decorator';
import { UserPayload } from '../../common/types';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('appointments')
@UseGuards(AuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  findAll(@CurrentUser() currentUser: UserPayload) {
    return this.appointmentsService.findByUser(currentUser.id, currentUser.role);
  }

  @Post()
  @Roles('pro')
  create(
    @Body() body: CreateAppointmentDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.appointmentsService.create(body, currentUser.id);
  }

  @Patch(':id')
  @Roles('pro')
  update(
    @Param('id') id: string,
    @Body() body: UpdateAppointmentDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.appointmentsService.update(id, body, currentUser.id);
  }

  @Delete(':id')
  @Roles('pro')
  remove(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.appointmentsService.remove(id, currentUser.id);
  }
}
