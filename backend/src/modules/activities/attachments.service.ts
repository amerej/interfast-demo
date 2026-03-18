import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../../db/drizzle';
import { activityAttachments } from '../../db/schema';
import { unlink } from 'fs/promises';
import { join } from 'path';

const UPLOADS_PATH = '/app/uploads';

@Injectable()
export class AttachmentsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async saveAttachments(activityId: string, files: Express.Multer.File[]) {
    const rows = await this.db
      .insert(activityAttachments)
      .values(
        files.map((f) => ({
          activityId,
          filename: f.filename,
          originalName: f.originalname,
          mimeType: f.mimetype,
        })),
      )
      .returning();
    return rows;
  }

  async findByActivity(activityId: string) {
    return this.db
      .select()
      .from(activityAttachments)
      .where(eq(activityAttachments.activityId, activityId));
  }

  async remove(id: string) {
    const [att] = await this.db
      .select()
      .from(activityAttachments)
      .where(eq(activityAttachments.id, id));

    if (att) {
      await this.db.delete(activityAttachments).where(eq(activityAttachments.id, id));
      try {
        await unlink(join(UPLOADS_PATH, att.filename));
      } catch {
        // file may already be missing, ignore
      }
    }
    return { deleted: true };
  }
}
