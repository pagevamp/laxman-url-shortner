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
import { SendVerificationRequestData } from './dto/send-verification-request-data';
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

  async sendVerificationLink(
    sendVerificationRequestData: SendVerificationRequestData,
  ) {
    try {
      const { email } = sendVerificationRequestData;
      if (!email) throw new BadRequestException('Email is required');
      const user = await this.userService.findOneByField('email', email);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.verifiedAt !== null) {
        throw new BadRequestException('User is already verified');
      }

      const existingVerificationEmail =
        await this.emailVerificationRepo.findOne({
          where: { userId: user.id },
        });

      if (existingVerificationEmail) {
        await this.emailVerificationRepo.delete(existingVerificationEmail.id);
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

  async verify(token: string) {
    try {
      console.log('the token here is:', token);
      if (!token) throw new BadRequestException('Token is required');
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

      await this.userService.update(user.id, { verifiedAt: new Date() });

      await this.emailVerificationRepo.delete({ token });

      return { message: EmailMessages.emailVerifySuccess };
    } catch (error) {
      console.error('Verification error:', error);
      throw new BadRequestException(EmailMessages.emailVerifyFailed);
    }
  }
}
