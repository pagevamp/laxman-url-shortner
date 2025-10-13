import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerification } from './email-verification.entity';
import { Repository } from 'typeorm';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepo: Repository<EmailVerification>,
  ) {}

  @Post('resend-verification')
  async reSendVerification(@Body('email') email: string) {
    if (!email) throw new BadRequestException('Email is required');

    return await this.emailService.sendVerificationLink(email);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token) throw new BadRequestException('Token is required');
    return await this.emailService.verify(token);
  }
}
