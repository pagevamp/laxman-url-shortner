import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class EmailService {
  private nodemailerTransport: Mail;
  constructor(private readonly jwtService: JwtService) {
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

  sendVerificationLink(email: string) {
    console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);
    const payload = { email };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
      expiresIn: 3600,
    });

    const url = `${process.env.EMAIL_CONFIRMATION_URL}?token=${token}`;

    const text = `Welcome to the application. To confirm the email address, click here: ${url}`;

    return this.sendMail({
      to: email,
      subject: 'Email confirmation',
      text,
    });
  }
}
