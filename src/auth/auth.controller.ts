import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupRequestData } from './dto/signup-user-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('sign-up')
  async signup(@Body() signupRequestData: SignupRequestData) {
    return this.authService.signUp(signupRequestData);
  }
}
