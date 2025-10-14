import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupRequestData } from './dto/signup-user-dto';
import { EmailService } from 'src/email/email.service';
import { LoginRequestData } from './dto/login-user-dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('sign-up')
  async signUp(@Body() signupRequestData: SignupRequestData) {
    const user = await this.authService.signUp(signupRequestData);
    await this.emailService.sendVerificationLink(signupRequestData.email);
    return {
      message: 'Signup succesfull, Verification email sent',
      user,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginRequestData: LoginRequestData) {
    return await this.authService.login(loginRequestData);
  }
}
