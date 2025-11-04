import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupRequestData } from './dto/signup-user-dto';

import { ResendEmailVerificationRequestData } from './dto/resend-verification-dto';

import { LoginRequestData } from './dto/login-user-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('sign-up')
  async signup(@Body() signupRequestData: SignupRequestData) {
    return this.authService.signUp(signupRequestData);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginRequestData: LoginRequestData) {
    return await this.authService.login(loginRequestData);
  }

  @Post('resend-verification')
  async reSendVerification(
    @Body()
    resendEmailVerificationRequestData: ResendEmailVerificationRequestData,
  ) {
    return await this.authService.sendVerificationLink(
      resendEmailVerificationRequestData,
    );
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token) throw new BadRequestException('Token is required');
    return await this.authService.verify(token);
  }
}
