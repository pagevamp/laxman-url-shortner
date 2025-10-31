import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from 'src/auth/auth.service';
import { RequestWithUser } from '../types/RequestWithUser';

@Injectable()
export class GuardService implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || typeof authHeader !== 'string' || !authHeader.trim()) {
      throw new UnauthorizedException('Please provide a token');
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    const decoded = await this.authService.validateToken(token);
    request.decodedData = decoded;
    const userData = request.decodedData;
    if (!userData) {
      throw new UnauthorizedException('Invalid or missing token');
    }
    return true;
  }
}
