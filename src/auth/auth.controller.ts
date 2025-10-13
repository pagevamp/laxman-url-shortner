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
    try {
      const user = await this.authService.signUp(signupRequestData);
      await this.emailService.sendVerificationLink(signupRequestData.email);
      console.log('email verification sent');
      return {
        message: 'Signup succesfull, Verification email sent',
        user,
      };
    } catch (error) {
      console.log('Failed to send verification' + error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginRequestData: LoginRequestData) {
    try {
      return await this.authService.login(loginRequestData);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
