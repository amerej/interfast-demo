import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ProClientsService } from './pro-clients.service';
import { AuthGuard } from '../../common/auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CurrentUser } from '../../common/user.decorator';
import { UserPayload } from '../../common/types';
import { CreateClientDto } from './dto/create-client.dto';

@Controller('pro/clients')
@UseGuards(AuthGuard, RolesGuard)
@Roles('pro')
export class ProClientsController {
  constructor(private readonly proClientsService: ProClientsService) {}

  @Get()
  async findAll(@CurrentUser() currentUser: UserPayload) {
    return this.proClientsService.findByPro(currentUser.id);
  }

  @Post()
  async create(@Body() body: CreateClientDto, @CurrentUser() currentUser: UserPayload) {
    return this.proClientsService.createAndLink(currentUser.id, body);
  }

  @Delete(':clientId')
  async unlink(@Param('clientId') clientId: string, @CurrentUser() currentUser: UserPayload) {
    return this.proClientsService.unlink(currentUser.id, clientId);
  }
}
