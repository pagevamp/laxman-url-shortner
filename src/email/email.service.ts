import { BadRequestException, Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { EmailVerification } from './email-verification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerificationPayload } from './email.interface';
import { EmailMessages } from './email.messages';
import { Throttle } from '@nestjs/throttler';
@Injectable()
export class EmailService {
  private nodemailerTransport: Mail;
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepo: Repository<EmailVerification>,
  ) {
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
  sendMail(options: Mail.Options) {
    return this.nodemailerTransport.sendMail(options);
  }

  @Throttle({ default: { limit: 2, ttl: 300000 } })
  async sendVerificationLink(email: string) {
    const user = await this.userService.findOneByField('email', email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.verifiedAt !== null) {
      throw new BadRequestException('User is already verified');
    }

    const payload: EmailVerificationPayload = {
      email,
    };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
      expiresIn: 3600,
    });

    const expiresAt = new Date(Date.now() + 3600 * 1000);

    const emailVerification = this.emailVerificationRepo.create({
      userId: user.id,
      token,
      expiresAt,
    });

    await this.emailVerificationRepo.save(emailVerification);

    const url = `${process.env.EMAIL_CONFIRMATION_URL}?token=${token}`;

    const text = `Welcome to the application. To confirm the email address, click here: ${url}`;

    try {
      await this.sendMail({
        to: email,
        subject: 'Email confirmation',
        text,
      });
      return {
        message: EmailMessages.emailSendSuccess,
      };
    } catch (error) {
      console.error('Failed to send verification email', error);
      throw new Error(EmailMessages.emailSendFailed);
    }
  }

  @Throttle({ default: { limit: 10, ttl: 300000 } })
  async verify(token: string) {
    try {
      const payload = this.jwtService.verify<EmailVerificationPayload>(token, {
        secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
      });

      const record = await this.emailVerificationRepo.findOneByOrFail({
        token,
      });

      if (record.expiresAt < new Date()) {
        throw new BadRequestException('Token has expired');
      }

      await this.emailVerificationRepo.save(record);

      const user = await this.userService.findOneByField(
        'email',
        payload.email,
      );
      if (!user) throw new Error('User not found');

      user.verifiedAt = new Date();

      await this.userService.update(user.id, user);

      await this.emailVerificationRepo.delete({ token });

      return { message: EmailMessages.emailVerifySuccess };
    } catch (error) {
      console.error('Verification error:', error);
      throw new BadRequestException(EmailMessages.emailVerifyFailed);
    }
  }
}
