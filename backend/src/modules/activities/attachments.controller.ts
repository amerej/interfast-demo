import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { AttachmentsService } from './attachments.service';
import { AuthGuard } from '../../common/auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';

const storage = diskStorage({
  destination: '/app/uploads',
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${extname(file.originalname)}`);
  },
});

@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get('activities/:activityId/attachments')
  findByActivity(@Param('activityId') activityId: string) {
    return this.attachmentsService.findByActivity(activityId);
  }

  @Post('activities/:activityId/attachments')
  @Roles('pro')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
        cb(null, allowed.includes(file.mimetype));
      },
    }),
  )
  async upload(
    @Param('activityId') activityId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files?.length) return [];
    return this.attachmentsService.saveAttachments(activityId, files);
  }

  @Delete('attachments/:id')
  @Roles('pro')
  remove(@Param('id') id: string) {
    return this.attachmentsService.remove(id);
  }
}
