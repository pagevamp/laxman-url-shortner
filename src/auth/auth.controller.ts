import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { SignupRequestData } from './dto/signup-user-dto';

import { ResendEmailVerificationRequestData } from './dto/resend-verification-dto';

import { LoginRequestData } from './dto/login-user-dto';
import { VerifyTokenRequestData } from './dto/verify-token-request-data';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('sign-up')
  async signup(@Body() signupRequestData: SignupRequestData) {
    return this.authService.signUp(signupRequestData);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginRequestData: LoginRequestData,
  ) {
    const { accessToken } = await this.authService.login(loginRequestData);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 172800000,
    });

    return { message: 'Logged in successfully' };
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
  async verifyEmail(@Query() verifyTokenRequestData: VerifyTokenRequestData) {
    return await this.authService.verify(verifyTokenRequestData);
  }
}
