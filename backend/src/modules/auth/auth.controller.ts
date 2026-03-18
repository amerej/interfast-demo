import { All, Controller, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../../config/auth';

@Controller('auth')
export class AuthController {
  private handler = toNodeHandler(auth);

  @All('*path')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    req.url = req.originalUrl;
    return this.handler(req, res);
  }
}
