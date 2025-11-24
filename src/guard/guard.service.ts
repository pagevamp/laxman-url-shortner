import {
  CanActivate,
  ExecutionContext,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from 'src/auth/auth.service';
import { RequestWithUser } from '../types/RequestWithUser';
import { VerifyTokenRequestData } from 'src/auth/dto/verify-token-request-data';

@Injectable()
export class GuardService implements CanActivate {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.cookies.accessToken as string;

    if (!authHeader || typeof authHeader !== 'string' || !authHeader.trim()) {
      throw new UnauthorizedException('Please provide a token');
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    const verifyTokenRequestData: VerifyTokenRequestData = {
      token: token,
    };

    const decoded = await this.authService.validateToken(
      verifyTokenRequestData,
    );
    request.decodedData = decoded;
    const userData = request.decodedData;

    if (!userData) {
      throw new UnauthorizedException('Invalid or missing token');
    }

    return true;
  }
}
