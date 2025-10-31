import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
@Injectable()
export class EmailService {
  private nodemailerTransport: Mail;
  constructor() {
    this.nodemailerTransport = createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  async sendMail(options: Mail.Options) {
    try {
      await this.nodemailerTransport.sendMail(options);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        'Failed to send email: ' + message,
      );
    }
  }
}
