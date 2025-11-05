import {
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

import { LoginRequestData } from './dto/login-user-dto';
import { ResendVerificationRequestData } from './dto/resend-verification-request-data';
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
  async login(@Body() loginRequestData: LoginRequestData) {
    return await this.authService.login(loginRequestData);
  }

  @Post('resend-verification')
  async reSendVerification(@Body() requestData: ResendVerificationRequestData) {
    return await this.authService.sendVerificationLink(requestData);
  }

  @Get('verify-email')
  async verifyEmail(@Query() verifyTokenRequestData: VerifyTokenRequestData) {
    return await this.authService.verify(verifyTokenRequestData);
  }
}
