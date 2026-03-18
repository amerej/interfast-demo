import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/user.decorator';
import { UserPayload } from '../../common/types';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getUser(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    if (currentUser.role !== 'pro' && currentUser.id !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.usersService.findById(id);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    if (currentUser.id !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.usersService.update(id, body);
  }
}
