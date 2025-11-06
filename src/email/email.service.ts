import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { SendMailRequestData } from './dto/send-mail-request-data';

@Injectable()
export class EmailService {
  private nodemailerTransport: Mail;

  constructor() {
    this.nodemailerTransport = createTransport({
      host: process.env.MAILTRAP_HOST,
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD_DEMO,
      },
    });
  }

  async sendMail(sendMailRequestData: SendMailRequestData) {
    try {
      await this.nodemailerTransport.sendMail({
        from: {
          name: 'URL Shortener',
          address: process.env.MAILTRAP_DOMAIN__ADDRESS!,
        },
        to: sendMailRequestData.to,
        subject: sendMailRequestData.subject,
        text: sendMailRequestData.text,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new InternalServerErrorException(
        `Failed to send email: ${message}`,
      );
    }
  }
}
