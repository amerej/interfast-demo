import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UserPayload } from '../../common/types';

@Controller('activities/:activityId/comments')
@UseGuards(AuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async findByActivity(@Param('activityId') activityId: string) {
    return this.commentsService.findByActivity(activityId);
  }

  @Post()
  async create(
    @Param('activityId') activityId: string,
    @Body() body: CreateCommentDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.commentsService.create(activityId, body.message, currentUser.id);
  }
}
