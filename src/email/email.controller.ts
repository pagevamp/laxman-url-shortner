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

import { SendVerificationRequestData } from './dto/send-verification-request-data';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

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
