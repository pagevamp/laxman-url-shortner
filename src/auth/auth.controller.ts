import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupRequestData } from './dto/signup-user-dto';

import { LoginRequestData } from './dto/login-user-dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @Post('sign-up')
  async signup(@Body() signupRequestData: SignupRequestData) {
    return this.authService.signUp(signupRequestData);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginRequestData: LoginRequestData) {
    return await this.authService.login(loginRequestData);
  }
}
