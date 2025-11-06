import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UserService } from './user.service';
import { RequestWithUser } from './types/RequestWithUser';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers['authorization'];

    if (
      !authHeader ||
      typeof authHeader !== 'string' ||
      authHeader.trim() === ''
    ) {
      throw new UnauthorizedException('Please provide a token');
    }

    const authToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    const decoded = this.userService.validateToken(authToken);
    request.decodedData = decoded;
    return true;
  }
}
