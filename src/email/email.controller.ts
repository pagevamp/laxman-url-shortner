import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerification } from './email-verification.entity';
import { Repository } from 'typeorm';
import { SendVerificationRequestData } from './dto/send-verification-request-data';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepo: Repository<EmailVerification>,
  ) {}

  @HttpCode(HttpStatus.ACCEPTED)
  @Post('resend-verification')
  async reSendVerification(@Body() body: SendVerificationRequestData) {
    return await this.emailService.sendVerificationLink(body);
  }

  @HttpCode(HttpStatus.OK)
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return await this.emailService.verify(token);
  }
}
