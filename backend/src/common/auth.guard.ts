import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { auth } from '../config/auth';
import { fromNodeHeaders } from 'better-auth/node';

interface AuthenticatedRequest extends Request {
  user?: Record<string, unknown>;
  session?: Record<string, unknown>;
}

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user || !session?.session) {
      throw new UnauthorizedException('Not authenticated');
    }

    req.user = session.user;
    req.session = session.session;
    return true;
  }
}
